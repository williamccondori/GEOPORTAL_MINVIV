import {Component, ElementRef, inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Map} from 'maplibre-gl';
import {DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';
import {firstValueFrom} from 'rxjs';
import {BackendPublicService} from '../../services/backend-public.service';

@Component({
  selector: 'app-layer-td',
  imports: [],
  templateUrl: './layer-td.component.html',
  styleUrl: './layer-td.component.css'
})
export class LayerTdComponent implements OnInit, OnDestroy {
  @ViewChild('mapContainer', {static: true}) mapContainer!: ElementRef;
  private readonly dialogRef = inject(DynamicDialogRef);
  private readonly dynamicDialogConfig = inject(DynamicDialogConfig);
  private readonly backendService = inject(BackendPublicService);

  private map!: Map;

  ngOnInit() {
    this.initializeMap();
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  private async initializeMap() {
    const layerId = this.dynamicDialogConfig.data?.id;
    const geojson = await firstValueFrom(
      this.backendService.getGeoJsonLayer(layerId)
    );

    console.log(geojson);

    this.map = new Map({
      container: this.mapContainer.nativeElement,
      style: 'https://api.maptiler.com/maps/streets-v2/style.json?key=lKmwu8R1REUJAd2AxqGr',
      center: [-77.0365, -12.0464], // Lima, Perú
      zoom: 13,
      pitch: 45, // Vista 3D
      bearing: 0
    });

    this.map.on('load', () => {
      this.addGeoJSON();
    });
  }

  private addGeoJSON() {
    // Agregar fuente GeoJSON
    // this.map.addSource('geojson-data', {
    //   type: 'geojson',
    //   data: this.geojsonData
    // });

    // Agregar capa 3D
    this.map.addLayer({
      id: 'geojson-3d',
      type: 'fill-extrusion',
      source: 'geojson-data',
      layout: {},
      paint: {
        'fill-extrusion-color': '#0080ff',
        'fill-extrusion-height': ['get', 'height'], // Usa la propiedad 'height' del GeoJSON
        'fill-extrusion-base': 0,
        'fill-extrusion-opacity': 0.8
      }
    });
  }
}
