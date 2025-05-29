export interface LocationRequest {
  query: string;
}

export interface LocationResponse {
  id: string;
  name: string;
  center: [number, number];
  zoom: number;
}
