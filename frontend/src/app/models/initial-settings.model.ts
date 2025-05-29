import { BaseLayer } from './base-layer.model';
import { WmsLayer } from './wms-layer.model';

export interface InitialSettings {
  latLong: number[];
  zoom: number;
  hasAttribution: boolean;
  baseLayers: BaseLayer[];
  defaultBaseLayerId: string;
  wmsLayers: WmsLayer[];
  defaultWmsLayerIds: string[];
}
