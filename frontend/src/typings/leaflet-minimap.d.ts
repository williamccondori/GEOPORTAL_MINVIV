interface MiniMapOptions {
  toggleDisplay: boolean;
  minimized: boolean;
}

declare module 'leaflet-minimap' {
  import * as L from 'leaflet';

  export class MiniMap extends L.Control {
    constructor(layer: L.TileLayer, options?: MiniMapOptions);
  }

  export function minimap(layer: L.TileLayer, options?: MiniMapOptions): MiniMap;

  declare module 'leaflet' {
    namespace control {
      function minimap(layer: L.TileLayer, options?: MiniMapOptions): MiniMap;
    }
  }
}
