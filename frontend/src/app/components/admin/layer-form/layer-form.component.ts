import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';

import { InputText } from 'primeng/inputtext';
import { TreeSelectModule } from 'primeng/treeselect';
import { TextareaModule } from 'primeng/textarea';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';

import { CategoryNode } from '../../../models/category.model';
import { FileUploadComponent } from '../../shared/file-upload/file-upload.component';

@Component({
  selector: 'app-layer-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputText,
    TreeSelectModule,
    TextareaModule,
    ToastModule,
    ButtonModule,
    FileUploadComponent,
  ],
  providers: [MessageService],
  templateUrl: './layer-form.component.html',
  styleUrl: './layer-form.component.css',
})
export class LayerFormComponent implements OnInit {
  private readonly messageService = inject(MessageService);

  formGroup: FormGroup = new FormGroup({
    name: new FormControl<string>('', [Validators.required]),
    layerName: new FormControl<string>('', [
      Validators.required,
      this.noSpacesValidator,
    ]),
    description: new FormControl<string>('', [Validators.required]),
    categoryId: new FormControl<string>('', [Validators.required]),
    shapeFile: new FormControl<File | null>(null, [Validators.required]),
  });

  categoryNodes: CategoryNode[] = [];

  ngOnInit(): void {
    this.loadCategories();
    this.setupNameSync();
  }

  private setupNameSync(): void {
    this.formGroup.get('name')?.valueChanges.subscribe(name => {
      if (name) {
        const layerName = name
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '');
        this.formGroup
          .get('layerName')
          ?.setValue(layerName, { emitEvent: false });
      }
    });
  }

  private loadCategories(): void {
    // Mock data for categories
    this.categoryNodes = [
      {
        id: '1',
        name: 'Categoría 1',
        children: [
          { id: '1-1', name: 'Subcategoría 1.1', children: [] },
          { id: '1-2', name: 'Subcategoría 1.2', children: [] },
        ],
      },
      {
        id: '2',
        name: 'Categoría 2',
        children: [{ id: '2-1', name: 'Subcategoría 2.1', children: [] }],
      },
    ];
  }

  private noSpacesValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value?.includes(' ')) {
      return { noSpaces: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.formGroup.valid) {
      const formData = new FormData();
      formData.append('name', this.formGroup.get('name')?.value);
      formData.append('layerName', this.formGroup.get('layerName')?.value);
      formData.append('description', this.formGroup.get('description')?.value);
      formData.append('categoryId', this.formGroup.get('categoryId')?.value);

      const file = this.formGroup.get('shapeFile')?.value;
      if (file) {
        formData.append('shapeFile', file);
      }

      this.submitForm(formData);
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Por favor complete todos los campos requeridos',
      });
    }
  }

  private submitForm(formData: FormData): void {
    // Implementation for sending formData to backend service
    console.error('FormData ready for submission:', formData);
    this.messageService.add({
      severity: 'info',
      summary: 'Información',
      detail: 'Formulario listo para envío al backend',
    });
  }
}
