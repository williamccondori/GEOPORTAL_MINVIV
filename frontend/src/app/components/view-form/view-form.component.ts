import { Component, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { v4 as uuidv4 } from 'uuid';

import { View } from '../../models/view.model';
import { StateService } from '../../services/state.service';

@Component({
  standalone: true,
  selector: 'app-view-form',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    InputGroupModule,
    ButtonModule,
    InputGroupAddon,
  ],
  templateUrl: './view-form.component.html',
})
export class ViewFormComponent implements OnInit {
  private readonly stateService = inject(StateService);
  private readonly dialogRef = inject(DynamicDialogRef);

  formGroup = new FormGroup({
    latitude: new FormControl({ value: 0, disabled: true }, [Validators.required]),
    longitude: new FormControl({ value: 0, disabled: true }, [Validators.required]),
    zoom: new FormControl({ value: 0, disabled: true }, [Validators.required]),
    name: new FormControl('', [Validators.required]),
  });

  ngOnInit() {
    this.stateService.mapInformationState$.subscribe((state) => {
      if (state) {
        this.formGroup.patchValue({
          latitude: state.latLng[0],
          longitude: state.latLng[1],
          zoom: state.zoom,
          name: '',
        });
      }
    });
  }

  onSubmit() {
    if (this.formGroup.valid) {
      const formValues = this.formGroup.getRawValue();
      const view: View = {
        ...formValues,
        id: uuidv4(),
      } as View;
      this.dialogRef.close(view);
    } else {
      this.formGroup.markAllAsTouched();
      this.formGroup.updateValueAndValidity();
    }
  }
}
