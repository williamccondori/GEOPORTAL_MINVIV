import { Component, Input } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

import { CategoryNode } from '../../../models/category.model';

@Component({
  selector: 'app-category-node',
  imports: [CardModule, ButtonModule],
  templateUrl: './category-node.component.html',
  styleUrl: './category-node.component.css',
})
export class CategoryNodeComponent {
  @Input() node: CategoryNode = {} as CategoryNode;
  @Input() onOpenForm!: (id?: string, parentId?: string) => void;
  @Input() onDelete!: (id: string) => void;

  openForm(id?: string, parentId?: string): void {
    this.onOpenForm(id, parentId);
  }

  delete(id: string): void {
    this.onDelete(id);
  }
}
