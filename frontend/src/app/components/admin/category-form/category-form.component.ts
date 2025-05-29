import { Component, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { MessageService, TreeNode } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { TreeSelectModule } from 'primeng/treeselect';
import { firstValueFrom } from 'rxjs';

import {
  Category,
  CategoryNode,
  CategoryParameter,
} from '../../../models/category.model';
import { Constants } from '../../../models/constants';
import { BackendService } from '../../../services/backend.service';
import { StateService } from '../../../services/state.service';

@Component({
  selector: 'app-category-form',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    ButtonModule,
    TreeSelectModule,
    IconFieldModule,
    InputIconModule,
  ],
  templateUrl: './category-form.component.html',
})
export class CategoryFormComponent implements OnInit {
  private readonly dialogRef = inject(DynamicDialogRef);
  private readonly dynamicDialogConfig = inject(DynamicDialogConfig);
  private readonly stateService = inject(StateService);
  private readonly messageService = inject(MessageService);
  private readonly backendService = inject(BackendService);

  categoryTree: TreeNode<string>[] = [];
  categoryId?: string;

  formGroup = new FormGroup({
    categoryParent: new FormControl<TreeNode<string> | undefined>({
      value: undefined,
      disabled: true,
    }),
    name: new FormControl<string>('', [Validators.required]),
    description: new FormControl<string>('', [Validators.required]),
  });

  async ngOnInit() {
    try {
      this.stateService.setIsLoadingState(true);
      const data = this.dynamicDialogConfig.data as CategoryParameter;
      if (data) {
        await this.getCategoryStructure();
        await this.getFromData(data);
      }
    } catch (e) {
      console.error(e);
      this.messageService.add({
        severity: 'error',
        summary: 'ERROR',
        detail: Constants.ERROR_MESSAGE,
      });
    } finally {
      this.stateService.setIsLoadingState(false);
    }
  }

  onSubmit() {
    if (this.formGroup.valid) {
      const formValues = this.formGroup.getRawValue();
      const categoryId: string | undefined = formValues.categoryParent
        ? formValues.categoryParent.data
        : undefined;
      const category: Category = {
        name: formValues.name,
        description: formValues.description,
        categoryId: categoryId,
      } as Category;
      this.dialogRef.close(category);
    } else {
      this.formGroup.markAllAsTouched();
      this.formGroup.updateValueAndValidity();
    }
  }

  private async getFromData(data: CategoryParameter) {
    const catalogFlatList = this.convertToFlat(this.categoryTree);
    if (data.id) {
      this.categoryId = data.id;
      const category = await firstValueFrom(
        this.backendService.getCategoryById(data.id)
      );
      if (category) {
        this.formGroup.patchValue({
          categoryParent:
            catalogFlatList.find(p => p.data === category.categoryId) ??
            undefined,
          name: category.name,
          description: category.description,
        });
      }
    } else {
      this.formGroup.patchValue({
        categoryParent:
          catalogFlatList.find(p => p.data === data.categoryId) ?? undefined,
      });
    }
  }

  private async getCategoryStructure() {
    const categoryList = await firstValueFrom(
      this.backendService.getCatalogStructure()
    );
    this.categoryTree = this.convertToTree(categoryList);
  }

  private convertToTree(nodes: CategoryNode[]): TreeNode<string>[] {
    return nodes.map(node => ({
      key: node.id.toString(),
      label: node.name,
      data: node.id,
      leaf: (node.children ?? []).length > 0,
      children: this.convertToTree(node.children ?? []),
    }));
  }

  private convertToFlat(tree: TreeNode<string>[]): TreeNode<string>[] {
    const flat: TreeNode<string>[] = [];

    const flatten = (nodes: TreeNode<string>[]) => {
      for (const node of nodes) {
        flat.push({ ...node });
        if (node.children && node.children.length > 0) {
          flatten(node.children);
        }
      }
    };

    flatten(tree);
    return flat;
  }
}
