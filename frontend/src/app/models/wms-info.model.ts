export interface WebMapServiceStyle {
  title: string;
  legend: string;
}

export interface WebMapServiceExport {
  name: string;
  url: string;
  type: string;
}

export interface WebMapServiceLayer {
  name: string;
  title: string;
  abstract: string;
  keywords: string[];
  boundingBox: number[];
  styles: WebMapServiceStyle[];
  exports: WebMapServiceExport[];
  thumbnail: string;
  selectedExport?: string;
}

export interface WebMapServiceInformation {
  url: string;
  name: string;
  title: string;
  version: string;
  description: string;
  keywords: string[];
  operations: string[];
  layers: WebMapServiceLayer[];
}

export interface WebMapServiceInformationTable {
  key: string;
  value: string | string[];
}
