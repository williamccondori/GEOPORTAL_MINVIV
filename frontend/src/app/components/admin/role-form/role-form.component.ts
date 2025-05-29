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

import { Role } from '../../../models/role.model';

@Component({
  standalone: true,
  selector: 'app-role-form',
  imports: [ButtonModule, FormsModule, InputTextModule, ReactiveFormsModule],
  templateUrl: './role-form.component.html',
})
export class RoleFormComponent {
  private readonly dialogRef = inject(DynamicDialogRef);

  formGroup: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
  });

  onSubmit() {
    if (this.formGroup.valid) {
      const formValues = this.formGroup.getRawValue();
      const role: Role = {
        ...formValues,
      } as Role;
      this.dialogRef.close(role);
    } else {
      this.formGroup.markAllAsTouched();
      this.formGroup.updateValueAndValidity();
    }
  }
}
