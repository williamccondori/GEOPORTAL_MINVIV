import { Component, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { firstValueFrom } from 'rxjs';

import { BaseLayer } from '../../../models/base-layer.model';
import { Constants } from '../../../models/constants';
import { BackendService } from '../../../services/backend.service';

@Component({
  standalone: true,
  selector: 'app-base-layer-form',
  imports: [ButtonModule, FormsModule, InputTextModule, ReactiveFormsModule],
  templateUrl: './base-layer-form.component.html',
})
export class BaseLayerFormComponent implements OnInit {
  private readonly dialogRef = inject(DynamicDialogRef);
  private readonly dynamicDialogConfig = inject(DynamicDialogConfig);
  private readonly messageService = inject(MessageService);
  private readonly backendService = inject(BackendService);

  formGroup: FormGroup = new FormGroup({
    url: new FormControl<string>('', [
      Validators.required,
      Validators.pattern('^(https?|ftp)://[^\\s/$.?#].*\\.[^\\s]*$'),
    ]),
    name: new FormControl<string>('', [Validators.required]),
    attribution: new FormControl<string>('', [Validators.required]),
  });

  async ngOnInit() {
    const data = this.dynamicDialogConfig.data as Partial<{ id: string }>;
    if (data.id) {
      try {
        const baseLayer = await firstValueFrom(
          this.backendService.getBaseLayerById(data.id)
        );
        this.formGroup.patchValue({
          url: baseLayer.url,
          name: baseLayer.name,
          attribution: baseLayer.attribution,
        });
      } catch (e) {
        console.error(e);
        this.messageService.add({
          severity: 'error',
          summary: 'ERROR',
          detail: Constants.ERROR_MESSAGE,
        });
      }
    }
  }

  onSubmit() {
    if (this.formGroup.valid) {
      const formValues = this.formGroup.getRawValue();
      const baseLayer: BaseLayer = {
        ...formValues,
      } as BaseLayer;
      this.dialogRef.close(baseLayer);
    } else {
      this.formGroup.markAllAsTouched();
      this.formGroup.updateValueAndValidity();
    }
  }
}
