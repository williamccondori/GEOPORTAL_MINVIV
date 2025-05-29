export interface Category {
  id?: string;
  categoryId?: string;
  name: string;
  description: string;
}

export interface CategoryParameter {
  id?: string;
  categoryId?: string;
}

export interface CategoryNode {
  id: string;
  name: string;
  children: CategoryNode[];
}
