import { CommonModule } from '@angular/common';
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
import { InputText } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TreeSelectModule } from 'primeng/treeselect';

import { FileUploadErrorEvent, FileUploadEvent, FileUploadModule } from 'primeng/fileupload';
import { firstValueFrom } from 'rxjs';
import { CategoryNode } from '../../../models/category.model';
import { Response } from '../../../models/response.model';
import { BackendService } from '../../../services/backend.service';
import { StateService } from '../../../services/state.service';
import { HttpResponse } from '@angular/common/http';
import { LayerForm } from '../../../models/layer.model';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Constants } from '../../../models/constants';

@Component({
  selector: 'app-layer-form',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputText,
    TreeSelectModule,
    TextareaModule,
    ButtonModule,
    FileUploadModule,
  ],
  providers: [MessageService],
  templateUrl: './layer-form.component.html',
  styleUrls: ['./layer-form.component.css'],
})
export class LayerFormComponent implements OnInit {
  private readonly messageService = inject(MessageService);
  private readonly backendService = inject(BackendService);
  private readonly stateService = inject(StateService);
  private readonly dialogRef = inject(DynamicDialogRef);

  formGroup: FormGroup = new FormGroup({
    categoryParent: new FormControl<TreeNode<string> | undefined>(
      {
        value: undefined,
        disabled: false,
      },
      [Validators.required],
    ),
    code: new FormControl<string>('', [
      Validators.required,
      Validators.pattern(/^[a-zA-Z0-9_-]+$/),
    ]),
    name: new FormControl<string>('', [Validators.required]),
    description: new FormControl<string>('', [Validators.required]),
    shapeFileName: new FormControl<string>('', [Validators.required]),
  });

  categoryNodes: CategoryNode[] = [];
  categoryTree: TreeNode<string>[] = [];

  files: File[] = [];

  fileApiUrl = '';

  ngOnInit(): void {
    this.initComponent();
  }

  async onSubmit(): Promise<void> {
    if (this.formGroup.valid) {
      const formValues = this.formGroup.value;
      const layerForm = {
        id: null,
        categoryId: formValues.categoryParent?.key,
        code: formValues.code,
        name: formValues.name,
        description: formValues.description,
        shapeFileName: formValues.shapeFileName,
      } as LayerForm;
      this.dialogRef.close(layerForm);
    } else {
      this.formGroup.markAllAsTouched();
      this.formGroup.updateValueAndValidity();
    }
  }

  onUpload(event: FileUploadEvent): void {
    // Agregar el archivo al arreglo de archivos.
    const { files } = event;
    if (files && files.length > 0) {
      this.files = files;
    }

    // Agregar al formulario el nombre del archivo guardado.
    const { originalEvent } = event;
    if (originalEvent instanceof HttpResponse) {
      const responseAPI: Response<string> = originalEvent?.body;
      this.formGroup.patchValue({
        shapeFileName: responseAPI.data,
      });
    }
  }

  onUploadError(event: FileUploadErrorEvent): void {
    const { error } = event;
    const errorAPI: Response<string> | null = error?.error;
    this.messageService.add({
      severity: 'error',
      summary: 'ERROR',
      detail: errorAPI?.message ?? 'Ocurrió un error al subir el archivo',
    });
  }

  onRemoveFile(): void {
    this.files = [];
    this.formGroup.patchValue({
      shapeFileName: '',
    });
  }

  private async initComponent(): Promise<void> {
    try {
      this.fileApiUrl = this.backendService.getApiUrl() + '/admin/files/';
      this.stateService.setIsLoadingState(true);
      await this.getCategoryStructure();
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

  private async getCategoryStructure(): Promise<void> {
    const categoryList = await firstValueFrom(this.backendService.getCatalogStructure());
    this.categoryTree = this.convertToTree(categoryList);
  }

  private convertToTree(nodes: CategoryNode[]): TreeNode<string>[] {
    return nodes.map((node) => ({
      key: node.id.toString(),
      label: node.name,
      data: node.id,
      leaf: (node.children ?? []).length > 0,
      children: this.convertToTree(node.children ?? []),
    }));
  }
}
