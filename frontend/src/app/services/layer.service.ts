import {Injectable, signal} from '@angular/core';
import {ActiveGeoJsonLayer, ActiveWmsLayer, UserWmsLayer} from '../models/layer.model';

@Injectable({
  providedIn: 'root',
})
export class LayerService {
  private readonly layersSignal = signal<UserWmsLayer[]>([]);
  readonly userWmslayers = this.layersSignal.asReadonly();

  private readonly activeLayersSignal = signal<ActiveWmsLayer[]>([]);
  readonly activeLayers = this.activeLayersSignal.asReadonly();

  private readonly activeGeoJsonLayersSignal = signal<ActiveGeoJsonLayer[]>([]);
  readonly activeGeoJsonLayers = this.activeGeoJsonLayersSignal.asReadonly();

  onAddUserWmsLayer(userWmsLayer: UserWmsLayer): void {
    const existingLayer = this.layersSignal().find((layer) => layer.id === userWmsLayer.id);
    if (!existingLayer) {
      this.layersSignal.update((layers) => [...layers, userWmsLayer]);
    }
  }

  onDeleteUserWmsLayer(id: string): void {
    this.layersSignal.update((layers) => layers.filter((layer) => layer.id !== id));
  }

  onAddActiveLayer(layer: ActiveWmsLayer): void {
    const existingLayer = this.activeLayersSignal().find(
      (activeLayer) => activeLayer.id === layer.id,
    );
    if (!existingLayer) {
      this.activeLayersSignal.update((layers) => [...layers, layer]);
    }
  }

  onDeleteActiveLayer(id: string): void {
    this.activeLayersSignal.update((layers) => layers.filter((layer) => layer.id !== id));
  }

  onDeleteAllActiveLayers(): void {
    this.activeLayersSignal.update(() => []);
  }

  onAddActiveGeoJsonLayer(layer: ActiveGeoJsonLayer): void {
    const existingLayer = this.activeGeoJsonLayersSignal().find(
      (activeLayer) => activeLayer.id === layer.id,
    );
    if (!existingLayer) {
      this.activeGeoJsonLayersSignal.update((layers) => [...layers, layer]);
    }
  }

  onDeleteActiveGeoJsonLayer(id: string): void {
    this.activeGeoJsonLayersSignal.update((layers) => layers.filter((layer) => layer.id !== id));
  }

  onDeleteAllActiveGeoJsonLayers(): void {
    this.activeGeoJsonLayersSignal.update(() => []);
  }

  updateOpacity(id: string, opacity: number): void {
    this.activeLayersSignal.update((layers) =>
      layers.map((layer) => (layer.id === id ? {...layer, opacity} : layer)),
    );
  }

  moveLayerToFront(id: string): void {
    this.activeLayersSignal.update((layers) => {
      const layerIndex = layers.findIndex((layer) => layer.id === id);
      if (layerIndex === -1) return layers;

      const maxZIndex = Math.max(...layers.map((l) => l.zIndex), 0);
      return layers.map((layer) => (layer.id === id ? {...layer, zIndex: maxZIndex + 1} : layer));
    });
  }

  moveLayerToBack(id: string): void {
    this.activeLayersSignal.update((layers) => {
      const layerIndex = layers.findIndex((layer) => layer.id === id);
      if (layerIndex === -1) return layers;

      const minZIndex = Math.min(...layers.map((l) => l.zIndex), 1);
      return layers.map((layer) => (layer.id === id ? {...layer, zIndex: minZIndex - 1} : layer));
    });
  }

  moveLayerUp(id: string): void {
    this.activeLayersSignal.update((layers) => {
      const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);
      const currentIndex = sortedLayers.findIndex((layer) => layer.id === id);

      if (currentIndex === -1 || currentIndex === sortedLayers.length - 1) {
        return layers;
      }

      const currentLayer = sortedLayers[currentIndex];
      const nextLayer = sortedLayers[currentIndex + 1];

      return layers.map((layer) => {
        if (layer.id === currentLayer.id) {
          return {...layer, zIndex: nextLayer.zIndex};
        } else if (layer.id === nextLayer.id) {
          return {...layer, zIndex: currentLayer.zIndex};
        }
        return layer;
      });
    });
  }

  moveLayerDown(id: string): void {
    this.activeLayersSignal.update((layers) => {
      const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);
      const currentIndex = sortedLayers.findIndex((layer) => layer.id === id);

      if (currentIndex === -1 || currentIndex === 0) {
        return layers;
      }

      const currentLayer = sortedLayers[currentIndex];
      const prevLayer = sortedLayers[currentIndex - 1];

      return layers.map((layer) => {
        if (layer.id === currentLayer.id) {
          return {...layer, zIndex: prevLayer.zIndex};
        } else if (layer.id === prevLayer.id) {
          return {...layer, zIndex: currentLayer.zIndex};
        }
        return layer;
      });
    });
  }
}
