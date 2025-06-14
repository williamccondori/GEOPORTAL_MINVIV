import {Component, ElementRef, inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Map, LngLatBounds} from 'maplibre-gl';
import {DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';
import {TableModule} from 'primeng/table';
import {firstValueFrom} from 'rxjs';
import {BackendPublicService} from '../../services/backend-public.service';

interface PropertyItem {
  key: string;
  value: any;
}

@Component({
  selector: 'app-layer-td',
  imports: [TableModule],
  templateUrl: './layer-td.component.html',
  styleUrl: './layer-td.component.css'
})
export class LayerTdComponent implements OnInit, OnDestroy {
  @ViewChild('mapContainer', {static: true}) mapContainer!: ElementRef;
  private readonly dialogRef = inject(DynamicDialogRef);
  private readonly dynamicDialogConfig = inject(DynamicDialogConfig);
  private readonly backendService = inject(BackendPublicService);

  private map!: Map;
  public properties: PropertyItem[] = [];
  ngOnInit() {
    // Usar setTimeout para asegurar que el DOM esté completamente renderizado
    setTimeout(() => {
      this.initializeMap();
    }, 100);
  }ngOnDestroy() {
    console.log('Destruyendo componente LayerTd...');

    if (this.map) {
      try {
        // Remover fuentes y capas si existen
        if (this.map.getLayer('geojson-outline')) {
          this.map.removeLayer('geojson-outline');
        }

        if (this.map.getSource('geojson-data')) {
          this.map.removeSource('geojson-data');
        }

        // Destruir el mapa completamente
        this.map.remove();
        console.log('Mapa destruido correctamente');
      } catch (error) {
        console.error('Error al destruir el mapa:', error);
      } finally {
        // Asegurar que la referencia sea null
        this.map = null as any;
      }
    }

    // Limpiar propiedades
    this.properties = [];

    // Limpiar el contenedor del mapa
    if (this.mapContainer?.nativeElement) {
      this.mapContainer.nativeElement.innerHTML = '';
    }
  }  private async initializeMap() {
    try {
      // Verificar que el contenedor esté disponible y tenga dimensiones
      if (!this.mapContainer?.nativeElement) {
        console.error('Contenedor del mapa no disponible');
        return;
      }

      const container = this.mapContainer.nativeElement;
      const rect = container.getBoundingClientRect();

      if (rect.width === 0 || rect.height === 0) {
        console.warn('El contenedor del mapa no tiene dimensiones válidas:', rect);
        // Intentar nuevamente después de un breve delay
        setTimeout(() => this.initializeMap(), 200);
        return;
      }

      const rowId = this.dynamicDialogConfig.data?.id;
      const layerId = this.dynamicDialogConfig.data?.layerId;

      if (!rowId || !layerId) {
        console.error('ID de fila o capa no proporcionados');
        return;
      }

      const geojson = await firstValueFrom(
        this.backendService.getGeoJsonLayer(layerId, rowId)
      );

      console.log('GeoJSON cargado:', geojson);

      // Verificar que no haya un mapa existente antes de crear uno nuevo
      if (this.map) {
        console.warn('Ya existe un mapa, destruyendo el anterior...');
        this.map.remove();
      }

      this.map = new Map({
        container: container,
        style: 'https://api.maptiler.com/maps/satellite/style.json?key=lKmwu8R1REUJAd2AxqGr',
        center: [-77.0365, -12.0464], // Lima, Perú
        zoom: 13,
        pitch: 45, // Vista 3D
        bearing: 0,
        //show attribution control
        attributionControl: false
      });

      this.map.on('load', () => {
        this.addGeoJSON(geojson);
      });

      this.map.on('error', (e) => {
        console.error('Error en el mapa:', e);
      });

    } catch (error) {
      console.error('Error al inicializar el mapa:', error);
    }
  }  private addGeoJSON(geojsonData: any) {
    this.map.addSource('geojson-data', {
      type: 'geojson',
      data: geojsonData
    });

    // Agregar capa de línea para los bordes rojos
    this.map.addLayer({
      id: 'geojson-outline',
      type: 'line',
      source: 'geojson-data',
      layout: {},
      paint: {
        'line-color': '#ff0000',
        'line-width': 2,
        'line-opacity': 1
      }
    });

    // Extraer propiedades del GeoJSON
    this.extractProperties(geojsonData);

    // Hacer zoom automático a la geometría
    this.zoomToGeoJSON(geojsonData);
  }

  /**
   * Calcula los bounds de una geometría GeoJSON y hace zoom a ella
   */  private zoomToGeoJSON(geojsonData: any, options: {
    padding?: number;
    duration?: number;
  } = {}) {const defaultOptions = {
      padding: 50,
      duration: 1500
    };

    const opts = { ...defaultOptions, ...options };

    try {
      const bounds = new LngLatBounds();      // Función recursiva para procesar diferentes tipos de geometría
      const addCoordinatesToBounds = (geometry: any) => {
        switch (geometry.type) {
          case 'Point':
            if (geometry.coordinates && geometry.coordinates.length >= 2) {
              bounds.extend([geometry.coordinates[0], geometry.coordinates[1]]);
            }
            break;

          case 'LineString':
          case 'MultiPoint':
            geometry.coordinates.forEach((coord: number[]) => {
              if (coord && coord.length >= 2) {
                bounds.extend([coord[0], coord[1]]);
              }
            });
            break;

          case 'Polygon':
          case 'MultiLineString':
            geometry.coordinates.forEach((ring: number[][]) => {
              ring.forEach((coord: number[]) => {
                if (coord && coord.length >= 2) {
                  bounds.extend([coord[0], coord[1]]);
                }
              });
            });
            break;

          case 'MultiPolygon':
            geometry.coordinates.forEach((polygon: number[][][]) => {
              polygon.forEach((ring: number[][]) => {
                ring.forEach((coord: number[]) => {
                  if (coord && coord.length >= 2) {
                    bounds.extend([coord[0], coord[1]]);
                  }
                });
              });
            });
            break;

          case 'GeometryCollection':
            geometry.geometries.forEach((geom: any) => addCoordinatesToBounds(geom));
            break;
        }
      };

      // Procesar el GeoJSON según su tipo
      if (geojsonData.type === 'FeatureCollection') {
        geojsonData.features.forEach((feature: any) => {
          if (feature.geometry) {
            addCoordinatesToBounds(feature.geometry);
          }
        });
      } else if (geojsonData.type === 'Feature') {
        if (geojsonData.geometry) {
          addCoordinatesToBounds(geojsonData.geometry);
        }
      } else {
        // Es una geometría directa
        addCoordinatesToBounds(geojsonData);
      }

      // Verificar si bounds es válido
      if (bounds.isEmpty()) {
        console.warn('No se pudieron calcular los bounds para la geometría GeoJSON');
        return;
      }      // Manejar caso especial para puntos únicos
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();

      if (sw.lng === ne.lng && sw.lat === ne.lat) {        // Es un punto único, usar flyTo en lugar de fitBounds
        this.map.flyTo({
          center: [sw.lng, sw.lat],
          zoom: 15,
          duration: opts.duration,
          essential: true
        });
      } else {
        // Hacer zoom a los bounds calculados basado en el bbox del GeoJSON
        this.map.fitBounds(bounds, {
          padding: opts.padding,
          duration: opts.duration,
          essential: true
        });
      }

    } catch (error) {
      console.error('Error al hacer zoom a la geometría GeoJSON:', error);
      // Fallback: mantener el zoom actual
    }
  }
  /**
   * Método público para hacer zoom a la geometría actual
   */
  public zoomToCurrentGeometry(options?: { padding?: number; duration?: number }) {
    if (this.map && this.map.getSource('geojson-data')) {
      const source = this.map.getSource('geojson-data') as any;
      if (source._data) {
        this.zoomToGeoJSON(source._data, options);
      }
    }
  }

  /**
   * Restablecer vista del mapa a Lima, Perú
   */
  public resetMapView() {
    if (this.map) {
      this.map.flyTo({
        center: [-77.0365, -12.0464],
        zoom: 13,
        pitch: 45,
        bearing: 0,
        duration: 1500,
        essential: true
      });
    }
  }

  /**
   * Extrae las propiedades del GeoJSON para mostrar en la tabla
   */
  private extractProperties(geojsonData: any) {
    this.properties = [];

    try {
      if (geojsonData.type === 'FeatureCollection' && geojsonData.features?.length > 0) {
        // Tomar las propiedades de la primera feature como ejemplo
        const firstFeature = geojsonData.features[0];
        if (firstFeature.properties) {
          this.processProperties(firstFeature.properties);
        }

        // Agregar información adicional sobre la colección
        this.properties.push(
          { key: 'Tipo', value: 'FeatureCollection' },
          { key: 'Número de Features', value: geojsonData.features.length }
        );

      } else if (geojsonData.type === 'Feature') {
        if (geojsonData.properties) {
          this.processProperties(geojsonData.properties);
        }
        this.properties.push({ key: 'Tipo', value: 'Feature' });

      } else {
        // Es una geometría directa
        this.properties.push({ key: 'Tipo', value: geojsonData.type || 'Geometría' });
      }

      // Agregar información sobre la geometría
      this.addGeometryInfo(geojsonData);

    } catch (error) {
      console.error('Error al extraer propiedades:', error);
      this.properties.push({ key: 'Error', value: 'No se pudieron cargar las propiedades' });
    }
  }

  /**
   * Procesa las propiedades de un objeto y las convierte al formato de la tabla
   */
  private processProperties(props: any) {
    if (props && typeof props === 'object') {
      Object.keys(props).forEach(key => {
        let value = props[key];

        // Formatear valores según su tipo
        if (value === null || value === undefined) {
          value = 'N/A';
        } else if (typeof value === 'object') {
          value = JSON.stringify(value);
        } else if (typeof value === 'boolean') {
          value = value ? 'Sí' : 'No';
        } else if (typeof value === 'number') {
          value = value.toLocaleString();
        }

        this.properties.push({ key, value: value.toString() });
      });
    }
  }

  /**
   * Agrega información sobre la geometría
   */
  private addGeometryInfo(geojsonData: any) {
    try {
      let geometry;

      if (geojsonData.type === 'FeatureCollection' && geojsonData.features?.length > 0) {
        geometry = geojsonData.features[0].geometry;
      } else if (geojsonData.type === 'Feature') {
        geometry = geojsonData.geometry;
      } else {
        geometry = geojsonData;
      }

      if (geometry) {
        this.properties.push({ key: 'Tipo de Geometría', value: geometry.type });

        // Información específica según el tipo de geometría
        if (geometry.coordinates) {
          switch (geometry.type) {
            case 'Point':
              this.properties.push(
                { key: 'Longitud', value: geometry.coordinates[0].toFixed(6) },
                { key: 'Latitud', value: geometry.coordinates[1].toFixed(6) }
              );
              break;
            case 'LineString':
              this.properties.push({ key: 'Puntos en línea', value: geometry.coordinates.length });
              break;
            case 'Polygon':
              this.properties.push({ key: 'Anillos', value: geometry.coordinates.length });
              break;
          }
        }
      }
    } catch (error) {
      console.error('Error al procesar información de geometría:', error);
    }
  }
}
