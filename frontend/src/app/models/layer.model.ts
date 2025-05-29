export interface UserWmsLayer {
  id: string;
  name: string;
  title: string;
  url: string;
}

export interface ActiveWmsLayer {
  id: string;
  name: string;
  title: string;
  url: string;
  opacity: number;
  zIndex: number;
}
