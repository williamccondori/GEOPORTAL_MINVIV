import { Component, Input, forwardRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  Validator,
  ValidationErrors,
} from '@angular/forms';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';

type FileValue = File | File[] | null;

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, FileUploadModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploadComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => FileUploadComponent),
      multi: true,
    },
  ],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.css',
})
export class FileUploadComponent implements ControlValueAccessor, Validator {
  private readonly messageService = inject(MessageService);

  @Input() accept = '.zip';
  @Input() maxFileSize = 5242880; // 5MB in bytes
  @Input() multiple = false;
  @Input() label = 'Seleccionar archivo';
  @Input() placeholder = 'Arrastre y suelte un archivo aquí o haga clic para seleccionar';
  @Input() hint = 'Solo archivos ZIP hasta 5MB';
  @Input() required = false;
  @Input() disabled = false;

  uploadedFile: File | null = null;
  value: FileValue = null;

  private onChange: (value: FileValue) => void = () => {
    // This will be overridden by registerOnChange
  };
  private onTouched = (): void => {
    // This will be overridden by registerOnTouched
  };

  // ControlValueAccessor implementation
  writeValue(value: FileValue): void {
    this.value = value;
    if (value) {
      this.uploadedFile = Array.isArray(value) ? value[0] : value;
    } else {
      this.uploadedFile = null;
    }
  }

  registerOnChange(fn: (value: FileValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // Validator implementation
  validate(): ValidationErrors | null {
    if (this.required && !this.value) {
      return { required: true };
    }

    if (this.value) {
      const files = Array.isArray(this.value) ? this.value : [this.value];

      for (const file of files) {
        // Check file type
        if (this.accept && !this.isFileTypeValid(file)) {
          return { invalidFileType: { allowedTypes: this.accept } };
        }

        // Check file size
        if (file.size > this.maxFileSize) {
          return {
            maxFileSize: {
              actualSize: file.size,
              maxSize: this.maxFileSize,
            },
          };
        }
      }
    }

    return null;
  }

  onFileSelect(event: { files: File[] }): void {
    this.onTouched();

    const selectedFiles = event.files;
    if (selectedFiles.length === 0) return;

    if (this.multiple) {
      // Validate each file
      const validFiles: File[] = [];

      for (const file of selectedFiles) {
        if (this.validateFile(file)) {
          validFiles.push(file);
        }
      }

      if (validFiles.length > 0) {
        this.value = validFiles;
        this.uploadedFile = validFiles[0]; // Show first file in UI
        this.onChange(this.value);
        this.showSuccessMessage(`${validFiles.length} archivo(s) cargado(s) correctamente`);
      }
    } else {
      const file = selectedFiles[0];
      if (this.validateFile(file)) {
        this.value = file;
        this.uploadedFile = file;
        this.onChange(this.value);
        this.showSuccessMessage('Archivo cargado correctamente');
      }
    }
  }

  onRemoveFile(): void {
    this.value = null;
    this.uploadedFile = null;
    this.onChange(this.value);
    this.onTouched();
  }

  private validateFile(file: File): boolean {
    // Check file type
    if (this.accept && !this.isFileTypeValid(file)) {
      this.showErrorMessage(`Solo se permiten archivos: ${this.accept}`);
      return false;
    }

    // Check file size
    if (file.size > this.maxFileSize) {
      const maxSizeMB = (this.maxFileSize / 1024 / 1024).toFixed(2);
      this.showErrorMessage(`El archivo no puede superar los ${maxSizeMB}MB`);
      return false;
    }

    return true;
  }

  private isFileTypeValid(file: File): boolean {
    if (!this.accept) return true;

    const acceptedTypes = this.accept.split(',').map((type) => type.trim());

    return acceptedTypes.some((acceptedType) => {
      if (acceptedType.startsWith('.')) {
        // Extension check
        return file.name.toLowerCase().endsWith(acceptedType.toLowerCase());
      } else {
        // MIME type check
        return file.type === acceptedType;
      }
    });
  }

  private showSuccessMessage(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: message,
    });
  }

  private showErrorMessage(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
    });
  }

  getFileSize(): string {
    if (!this.uploadedFile) return '';
    return `(${(this.uploadedFile.size / 1024 / 1024).toFixed(2)} MB)`;
  }

  getFileCount(): string {
    if (!this.value) return '';
    if (Array.isArray(this.value)) {
      return this.value.length > 1 ? ` y ${this.value.length - 1} más` : '';
    }
    return '';
  }
}
