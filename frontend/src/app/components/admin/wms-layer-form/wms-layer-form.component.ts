import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';

import { View } from '../../../models/view.model';
import { WmsLayer } from '../../../models/wms-layer.model';

@Component({
  standalone: true,
  selector: 'app-wms-layer-form',
  imports: [ButtonModule, FormsModule, InputTextModule, ReactiveFormsModule],
  templateUrl: './wms-layer-form.component.html',
})
export class WmsLayerFormComponent {
  private readonly dialogRef = inject(DynamicDialogRef);

  formGroup: FormGroup = new FormGroup({
    url: new FormControl('', [
      Validators.required,
      Validators.pattern('^(https?|ftp)://[^\\s/$.?#].*\\.[^\\s]*$'),
    ]),
    name: new FormControl('', [Validators.required]),
    attribution: new FormControl('', [Validators.required]),
  });

  onSubmit() {
    if (this.formGroup.valid) {
      const formValues = this.formGroup.getRawValue();
      const wmsLayer: WmsLayer = {
        ...formValues,
      } as WmsLayer;
      this.dialogRef.close(wmsLayer);
    } else {
      this.formGroup.markAllAsTouched();
      this.formGroup.updateValueAndValidity();
    }
  }
}
