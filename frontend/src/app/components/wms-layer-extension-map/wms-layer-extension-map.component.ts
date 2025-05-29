import { AfterViewInit, Component, Input, OnDestroy } from '@angular/core';

import * as L from 'leaflet';

// @ts-ignore
@Component({
  selector: 'app-wms-layer-extension-map',
  imports: [],
  templateUrl: './wms-layer-extension-map.component.html',
})
export class WmsLayerExtensionMapComponent implements AfterViewInit, OnDestroy {
  @Input() boundingBox!: number[];
  @Input() layerName!: string;
  map?: L.Map;

  ngAfterViewInit(): void {
    if (this.boundingBox && this.layerName) {
      const mapId = `map-${this.layerName}-${this.boundingBox.join('-')}`;
      this.map = L.map(mapId, {
        center: [0, 0],
        attributionControl: false,
        scrollWheelZoom: false,
        dragging: false,
        zoomControl: false,
        zoom: 0,
        layers: [
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
          }),
        ],
      });

      const bbox = [
        -78.9855575561523, // lonMin (x1)
        -17.1127166748047, // latMin (y1)
        -68.7819137573242, // lonMax (x2)
        -5.62209224700928, // latMax (y2)
      ];

      const geoJson: any = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [bbox[0], bbox[1]], // bottom-left
                  [bbox[0], bbox[3]], // top-left
                  [bbox[2], bbox[3]], // top-right
                  [bbox[2], bbox[1]], // bottom-right
                  [bbox[0], bbox[1]], // close polygon
                ],
              ],
            },
          },
        ],
      };

      const geoJsonStyle = {
        style: {
          color: 'orange',
          weight: 2,
          fillOpacity: 0.5,
        },
      };

      const geoJsonLayer = L.geoJSON(geoJson, geoJsonStyle);
      this.map.addLayer(geoJsonLayer);
      this.map.fitBounds(geoJsonLayer.getBounds());
    }
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.off();
      this.map.remove();
    }
  }
}
