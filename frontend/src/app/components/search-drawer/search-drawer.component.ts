import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

import { View } from '../../models/view.model';
import { StateService } from '../../services/state.service';

@Component({
  standalone: true,
  selector: 'app-search-drawer',
  imports: [
    DrawerModule,
    AsyncPipe,
    ButtonModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    SelectModule,
  ],
  templateUrl: './search-drawer.component.html',
})
export class SearchDrawerComponent {
  formGroup: FormGroup = new FormGroup({
    departmentId: new FormControl('', [Validators.required]),
    provinceId: new FormControl('', [Validators.required]),
    districtId: new FormControl('', [Validators.required]),
    zoom: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required]),
  });

  private readonly stateService = inject(StateService);

  get isVisible() {
    return this.stateService.searchDrawerState$;
  }

  onHide() {
    this.stateService.setSearchDrawerState(false);
  }

  onSubmit() {
    if (this.formGroup.valid) {
      const formValues = this.formGroup.getRawValue();
      const view: View = {
        ...formValues,
      } as View;
    }
  }
}
