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

import { Constants } from '../../../models/constants';
import { User } from '../../../models/user.model';
import { BackendService } from '../../../services/backend.service';

@Component({
  standalone: true,
  selector: 'app-user-form',
  imports: [ButtonModule, FormsModule, InputTextModule, ReactiveFormsModule],
  templateUrl: './user-form.component.html',
})
export class UserFormComponent implements OnInit {
  private readonly dialogRef = inject(DynamicDialogRef);
  private readonly dynamicDialogConfig = inject(DynamicDialogConfig);
  private readonly messageService = inject(MessageService);
  private readonly backendService = inject(BackendService);

  formGroup: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(20),
      Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{6,20}$'),
    ]),
  });

  async ngOnInit() {
    const data = this.dynamicDialogConfig.data as Partial<{ id: string }>;
    if (data.id) {
      try {
        const baseLayer = await firstValueFrom(this.backendService.getUserById(data.id));
        this.formGroup.patchValue({
          name: baseLayer.name,
          lastName: baseLayer.lastName,
          email: baseLayer.email,
          username: baseLayer.username,
        });
      } catch (e) {
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
      const user: User = {
        ...formValues,
      } as User;
      this.dialogRef.close(user);
    } else {
      this.formGroup.markAllAsTouched();
      this.formGroup.updateValueAndValidity();
    }
  }
}
