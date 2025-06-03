import * as L from 'leaflet';

export interface Layer {
  id: string;
  categoryName: string;
  code: string;
  name: string;
  isVisible: boolean;
}

export interface LayerForm {
  id: string | null;
  categoryId: string;
  code: string;
  name: string;
  description: string;
  shapeFileName: string;
}

export interface UserWmsLayer {
  id: string;
  name: string;
  title: string;
  url: string;
}

export interface InternalLayer {
  id: string;
  categoryName: string;
  name: string;
  title: string;
  description: string;
  url: string;
  downloadUrl: string;
}

export interface ActiveWmsLayer {
  id: string;
  name: string;
  title: string;
  url: string;
  opacity: number;
  zIndex: number;
}

export interface ActiveGeoJsonLayer {
  id: string;
  name: string;
  title: string;
  geojson: GeoJSON.FeatureCollection | GeoJSON.Feature; // GeoJSON data
  opacity: number;
  zIndex: number;
  style?: L.PathOptions; // Leaflet style options
}

export interface LayerInformationOption {
  id: string;
  label: string;
}

export interface LayerInformationFilter {
  name: string;
  options: LayerInformationOption[];
}

export interface LayerInformationTable {
  columns: string[];
  data: [];
  filters: LayerInformationFilter[];
}

export interface WebMapServiceFeatureRequest {
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  boundingBox: string;
  layers: string;
  filters: string[] | null;
}

export interface WebMapServiceFeatureProperty {
  key: string;
  value: string;
}

export interface WebMapServiceFeature {
  information: WebMapServiceFeatureProperty[];
}
