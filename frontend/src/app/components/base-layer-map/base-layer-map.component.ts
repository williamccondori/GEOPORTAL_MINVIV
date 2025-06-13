import {AfterViewInit, Component, Input} from '@angular/core';

import * as L from 'leaflet';

import {BaseLayer} from '../../models/base-layer.model';

@Component({
  standalone: true,
  selector: 'app-base-layer-map',
  imports: [],
  templateUrl: './base-layer-map.component.html',
})
export class BaseLayerMapComponent implements AfterViewInit {
  @Input() baseLayer!: BaseLayer;
  map?: L.Map;

  ngAfterViewInit(): void {
    if (this.baseLayer) {
      const mapId = `map-${this.baseLayer.id}`;
      this.map = L.map(mapId, {
        center: [-9.19, -75.0152],
        attributionControl: false,
        scrollWheelZoom: false,
        dragging: false,
        zoomControl: false,
        zoom: 3,
        layers: [
          L.tileLayer(this.baseLayer.url, {
            maxZoom: 3,
          }),
        ],
      });
    }
  }
}
