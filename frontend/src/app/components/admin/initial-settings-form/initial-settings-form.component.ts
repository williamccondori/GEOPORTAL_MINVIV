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
import { FieldsetModule } from 'primeng/fieldset';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { firstValueFrom } from 'rxjs';

import { BaseLayer } from '../../../models/base-layer.model';
import { Constants } from '../../../models/constants';
import { InitialSettings } from '../../../models/initial-settings.model';
import { WmsLayer } from '../../../models/wms-layer.model';
import { BackendService } from '../../../services/backend.service';
import { StateService } from '../../../services/state.service';

@Component({
  standalone: true,
  selector: 'app-initial-settings-form',
  imports: [
    ButtonModule,
    FormsModule,
    InputTextModule,
    ReactiveFormsModule,
    FieldsetModule,
    InputTextModule,
    SelectModule,
    MultiSelectModule,
    ToggleSwitchModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './initial-settings-form.component.html',
})
export class InitialSettingsFormComponent implements OnInit {
  private readonly stateService = inject(StateService);
  private readonly backendService = inject(BackendService);
  private readonly messageService = inject(MessageService);

  formGroup: FormGroup = new FormGroup({
    id: new FormControl<string | undefined>(undefined, []),
    latitude: new FormControl<number>(0, [Validators.required]),
    longitude: new FormControl<number>(0, [Validators.required]),
    zoom: new FormControl<number>(0, [Validators.required]),
    hasAttribution: new FormControl<boolean>(false, [Validators.required]),
    defaultBaseLayerId: new FormControl<string>('', [Validators.required]),
    wmsLayerIds: new FormControl<string[]>([]),
  });

  baseLayers: BaseLayer[] = [];
  wmsLayers: WmsLayer[] = [];

  async ngOnInit() {
    try {
      this.stateService.setIsLoadingState(true);
      await this.getData();
      await this.getInitialSettings();
    } catch (e) {
      console.error(e);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: Constants.ERROR_MESSAGE,
      });
    } finally {
      this.stateService.setIsLoadingState(false);
    }
  }

  async onSubmit() {
    if (this.formGroup.valid) {
      try {
        this.stateService.setIsLoadingState(true);

        const initialSettings: InitialSettings = {
          ...this.formGroup.value,
        } as InitialSettings;

        await firstValueFrom(this.backendService.updateInitialSettings(initialSettings));

        await this.getInitialSettings();

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: Constants.SUCCESS_MESSAGE,
        });
      } catch (e) {
        console.error(e);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: Constants.ERROR_MESSAGE,
        });
      } finally {
        this.stateService.setIsLoadingState(false);
      }
    } else {
      this.formGroup.markAllAsTouched();
      this.formGroup.updateValueAndValidity();
    }
  }

  private async getData() {
    this.baseLayers = await firstValueFrom(this.backendService.getAllBaseLayers());
    this.wmsLayers = await firstValueFrom(this.backendService.getAllWmsLayers());
  }

  private async getInitialSettings() {
    const initialSettings = await firstValueFrom(this.backendService.getInitialSettings());
    this.formGroup.patchValue(initialSettings);
  }
}
