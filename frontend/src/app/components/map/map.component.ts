import {
  AfterViewInit,
  Component,
  effect,
  inject,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import * as L from 'leaflet';
import 'leaflet-minimap';
import { MenuItem, MessageService } from 'primeng/api';
import { ContextMenuModule } from 'primeng/contextmenu';
import { SpeedDialModule } from 'primeng/speeddial';
import { ToastModule } from 'primeng/toast';
import { firstValueFrom } from 'rxjs';

import { CoordinatesControlComponent } from '../../leaflet-controls/coordinates-control/coordinates-control.component';
import { LayerToolsControlComponent } from '../../leaflet-controls/layer-tools-control/layer-tools-control.component';
import { LogoControlComponent } from '../../leaflet-controls/logo-control/logo-control.component';
import { ToolsControlComponent } from '../../leaflet-controls/tools-control/tools-control.component';
import { Constants } from '../../models/constants';
import { InitialSettings } from '../../models/initial-settings.model';
import {
  ActiveWmsLayer,
  WebMapServiceFeatureRequest,
} from '../../models/layer.model';
import { MapInformation } from '../../models/map.model';
import { BackendPublicService } from '../../services/backend-public.service';
import { ComponentInjectorService } from '../../services/component-injector.service';
import { LayerService } from '../../services/layer.service';
import { StateService } from '../../services/state.service';

@Component({
  standalone: true,
  selector: 'app-map',
  imports: [ContextMenuModule, SpeedDialModule, ToastModule],
  providers: [MessageService],
  templateUrl: './map.component.html',
})
export class MapComponent implements OnInit, AfterViewInit {
  private readonly backendPublicService = inject(BackendPublicService);
  private readonly stateService = inject(StateService);
  private readonly messageService = inject(MessageService);
  private readonly componentInjectorService = inject(ComponentInjectorService);
  private readonly layerService = inject(LayerService);
  private readonly route = inject(ActivatedRoute);
  private readonly activeLayersMap = new Map<string, L.TileLayer.WMS>();

  map?: L.Map;
  rightClickLatLng?: L.LatLng;
  items: MenuItem[] = [];
  drawItems: MenuItem[] = [];

  baseLayerLeaflet?: L.TileLayer;

  constructor() {
    effect(() => {
      const activeLayers: ActiveWmsLayer[] = this.layerService.activeLayers();

      if (this.map) {
        const currentLayerIds = new Set(activeLayers.map(layer => layer.name));

        // Remove layers that are no longer active.
        this.activeLayersMap.forEach((leafletLayer, layerId) => {
          if (!currentLayerIds.has(layerId)) {
            this.map!.removeLayer(leafletLayer);
            this.activeLayersMap.delete(layerId);
          }
        });

        // Add new active layers or update existing ones.
        activeLayers.forEach(activeLayer => {
          const existingLayer = this.activeLayersMap.get(activeLayer.name);

          if (existingLayer) {
            // If the layer already exists, update its opacity and zIndex.
            existingLayer.setOpacity(activeLayer.opacity ?? 1);
            existingLayer.setZIndex(activeLayer.zIndex ?? 1);
          } else {
            // If the layer doesn't exist, create and add it.
            const layer = L.tileLayer.wms(activeLayer.url, {
              layers: activeLayer.name,
              format: 'image/png',
              transparent: true,
              attribution: activeLayer.title,
              zIndex: activeLayer.zIndex ?? 1,
              opacity: activeLayer.opacity ?? 1,
            });
            this.map!.addLayer(layer);
            this.activeLayersMap.set(activeLayer.name, layer);
          }
        });
      }
    });
  }

  ngOnInit(): void {
    this.loadComponent();
  }

  private async loadComponent(): Promise<void> {
    try {
      this.stateService.setIsLoadingState(true);
      await this.getInitialSettings();
      this.fillMenu();
    } catch (e) {
      console.error(e);
      this.messageService.add({
        severity: 'error',
        summary: 'ERROR',
        detail: Constants.ERROR_MESSAGE,
      });
    } finally {
      this.stateService.setIsLoadingState(false);
    }
  }

  ngAfterViewInit(): void {
    this.map = L.map('map');
    this.map.on('moveend', () => {
      const center = this.map?.getCenter();
      const zoom = this.map?.getZoom();
      const mapInformation = {
        latLng: [center ? center.lat : 0, center ? center.lng : 0],
        zoom: zoom ?? 0,
      } as MapInformation;
      this.stateService.setMapInformationState(mapInformation);
    });
    this.map.on('contextmenu', (event: L.LeafletMouseEvent) => {
      this.rightClickLatLng = event.latlng;
    });

    const { element: toolsElement } =
      this.componentInjectorService.createComponent(ToolsControlComponent);
    const toolsControl = new L.Control({ position: 'topright' });
    toolsControl.onAdd = () => toolsElement;
    this.map.addControl(toolsControl);

    // Logo control.
    const { element: logoElement } =
      this.componentInjectorService.createComponent(LogoControlComponent);
    const logoControl = new L.Control({ position: 'bottomright' });
    logoControl.onAdd = () => logoElement;
    this.map.addControl(logoControl);

    // Coordinates control.
    const { element: coordinatesElement } =
      this.componentInjectorService.createComponent(
        CoordinatesControlComponent
      );
    const coordinatesControl = new L.Control({ position: 'bottomright' });
    coordinatesControl.onAdd = () => coordinatesElement;
    this.map.addControl(coordinatesControl);

    // Scale control.
    const scaleControl = L.control.scale({
      position: 'bottomleft',
      maxWidth: 100,
    });
    this.map.addControl(scaleControl);

    // Layer tools control.
    const { element: layerToolsElement } =
      this.componentInjectorService.createComponent(LayerToolsControlComponent);
    const layerToolsControl = new L.Control({ position: 'bottomleft' });
    layerToolsControl.onAdd = () => layerToolsElement;
    this.map.addControl(layerToolsControl);

    // Change center.
    this.stateService.centerState$.subscribe(center => {
      if (center) {
        this.map?.setView(new L.LatLng(center.lat, center.lng), 12);
      }
    });

    // Change zoom.
    this.stateService.zoomState$.subscribe(zoom => {
      if (zoom) {
        this.map?.setZoom(zoom);
      }
    });

    // Change base layer.
    this.stateService.baseLayerState$.subscribe(baseLayer => {
      if (baseLayer) {
        if (this.baseLayerLeaflet) {
          this.map?.removeLayer(this.baseLayerLeaflet);
        }
        this.baseLayerLeaflet = L.tileLayer(baseLayer.url, {
          id: baseLayer.id,
          attribution: baseLayer.attribution,
          detectRetina: true,
          zIndex: 0,
        });
        this.map?.addLayer(this.baseLayerLeaflet);
      }
    });
  }

  async getInitialSettings(): Promise<void> {
    const initialSettings = await firstValueFrom(
      this.backendPublicService.getInitialSettings()
    );
    this.loadInitialSettings(initialSettings);
  }

  private loadInitialSettings(settings: InitialSettings): void {
    if (this.map) {
      // Check for URL parameters first
      const urlParams = this.route.snapshot.queryParams;
      const hasUrlParams =
        urlParams['lat'] && urlParams['lng'] && urlParams['zoom'];

      let lat: number, lng: number, zoom: number;

      if (hasUrlParams) {
        // Use URL parameters if available
        lat = parseFloat(urlParams['lat']);
        lng = parseFloat(urlParams['lng']);
        zoom = parseInt(urlParams['zoom'], 10);

        // Validate the parameters
        if (
          !isNaN(lat) &&
          !isNaN(lng) &&
          !isNaN(zoom) &&
          lat >= -90 &&
          lat <= 90 &&
          lng >= -180 &&
          lng <= 180 &&
          zoom >= 1 &&
          zoom <= 20
        ) {
          // Parameters are valid, use them
        } else {
          // Fall back to default settings if invalid parameters
          lat = settings.latLong[0];
          lng = settings.latLong[1];
          zoom = settings.zoom;
        }
      } else {
        // Use default settings from backend
        lat = settings.latLong[0];
        lng = settings.latLong[1];
        zoom = settings.zoom;
      }

      this.map.setView(new L.LatLng(lat, lng), zoom);

      if (!settings.hasAttribution) {
        this.map.attributionControl.remove();
      }

      const baseLayer = settings.baseLayers.find(
        x => x.id === settings.defaultBaseLayerId
      );

      if (baseLayer) {
        this.baseLayerLeaflet = L.tileLayer(baseLayer.url, {
          id: baseLayer.id,
          attribution: baseLayer.attribution,
          detectRetina: true,
        });
        this.map.addLayer(this.baseLayerLeaflet);

        // MiniMap control.
        const minimapControl = L.control.minimap(L.tileLayer(baseLayer.url), {
          toggleDisplay: true,
          minimized: false,
        });
        this.map.addControl(minimapControl);
      }
    }
  }

  private fillMenu(): void {
    this.items = [
      {
        label: 'Buscar en este punto',
        icon: 'pi pi-search',
        command: () => this.searchInThisPoint(),
      },
      {
        label: 'Ver en Google Maps',
        icon: 'pi pi-map',
        command: () => this.showInGoogleMaps(),
      },
      {
        label: 'Ver en Google Street View',
        icon: 'pi pi-camera',
        command: () => this.showInGoogleStreetView(),
      },
    ];
  }

  private async searchInThisPoint(): Promise<void> {
    if (!this.map || !this.rightClickLatLng) return;

    const size = this.map.getSize();
    const bounds = this.map.getBounds();
    const latlng = this.rightClickLatLng;
    const pointOfQuery = this.map.latLngToContainerPoint(latlng);

    const params = {
      width: size.x,
      height: size.y,
      x: Math.round(pointOfQuery.x),
      y: Math.round(pointOfQuery.y),
      boundingBox: bounds.toBBoxString(),
    } as WebMapServiceFeatureRequest;

    const activeLayers = this.layerService.activeLayers();

    const urlToLayers: Record<string, string[]> = {};
    for (const layer of activeLayers) {
      if (!urlToLayers[layer.url]) urlToLayers[layer.url] = [];
      urlToLayers[layer.url].push(layer.name);
    }

    const layerQueries = Object.entries(urlToLayers).map(([url, layers]) => {
      const paramsToSend = {
        ...params,
        url,
        layers: layers.join(','),
      };
      return firstValueFrom(
        this.backendPublicService.getWmsFeatureInformation(paramsToSend)
      );
    });

    try {
      this.stateService.setIsLoadingState(true);
      const results = await Promise.all(layerQueries);
      this.stateService.setLayerPropertyDrawerState({
        visible: true,
        data: results,
      });
    } catch (e) {
      console.error(e);
      this.messageService.add({
        severity: 'error',
        summary: 'ERROR',
        detail: Constants.ERROR_MESSAGE,
      });
    } finally {
      this.stateService.setIsLoadingState(false);
    }
  }

  private showInGoogleMaps(): void {
    if (this.map) {
      const center = this.map.getCenter();
      const lat = center.lat;
      const lng = center.lng;
      const zoom = this.map.getZoom();
      const url = `https://www.google.com/maps/@${lat},${lng},${zoom}z`;
      window.open(url, '_blank');
    }
  }

  private showInGoogleStreetView(): void {
    if (this.map && this.rightClickLatLng) {
      const lat = this.rightClickLatLng.lat;
      const lng = this.rightClickLatLng.lng;
      const url = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;
      window.open(url, '_blank');
    }
  }
}
