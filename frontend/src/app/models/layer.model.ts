export interface Layer {
  id: string;
  categoryName: string;
  code: string;
  name: string;
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

export interface ActiveWmsLayer {
  id: string;
  name: string;
  title: string;
  url: string;
  opacity: number;
  zIndex: number;
}
