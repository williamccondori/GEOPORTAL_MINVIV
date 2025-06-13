import {AsyncPipe} from '@angular/common';
import {Component, inject} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators,} from '@angular/forms';

import {MessageService} from 'primeng/api';
import {ButtonModule} from 'primeng/button';
import {CardModule} from 'primeng/card';
import {DividerModule} from 'primeng/divider';
import {DrawerModule} from 'primeng/drawer';
import {InputGroup} from 'primeng/inputgroup';
import {InputTextModule} from 'primeng/inputtext';
import {TableModule} from 'primeng/table';
import {TabsModule} from 'primeng/tabs';
import {ToastModule} from 'primeng/toast';
import {firstValueFrom, Observable} from 'rxjs';

import {Constants} from '../../models/constants';
import {LocationRequest, LocationResponse} from '../../models/location.model';
import {BackendPublicService} from '../../services/backend-public.service';
import {StateService} from '../../services/state.service';

@Component({
  standalone: true,
  selector: 'app-location-drawer',
  imports: [
    DrawerModule,
    AsyncPipe,
    CardModule,
    TabsModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    InputGroup,
    DividerModule,
    ReactiveFormsModule,
    ToastModule,
    TableModule,
  ],
  providers: [MessageService],
  templateUrl: './location-drawer.component.html',
})
export class LocationDrawerComponent {
  private readonly stateService = inject(StateService);
  private readonly messageService = inject(MessageService);
  private readonly backendPublicService = inject(BackendPublicService);

  locations: LocationResponse[] = [];

  formGroup = new FormGroup({
    query: new FormControl('', [Validators.required]),
  });

  formGroupCoordinate = new FormGroup({});

  onDrawerOpen(): void {
    this.formGroup.reset();
    this.formGroupCoordinate.reset();

    this.locations = [];
  }

  get isVisible(): Observable<boolean> {
    return this.stateService.locationDrawerState$;
  }

  onHide(): void {
    this.stateService.setLocationDrawerState(false);
  }

  async onSubmit(): Promise<void> {
    if (this.formGroup.valid) {
      const formValues = this.formGroup.getRawValue();
      const locationRequest: LocationRequest = {
        ...formValues,
      } as LocationRequest;
      try {
        this.stateService.setIsLoadingState(true);
        this.locations = await firstValueFrom(
          this.backendPublicService.getAllLocations(locationRequest),
        );
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
    } else {
      this.formGroup.markAllAsTouched();
      this.formGroup.updateValueAndValidity();
    }
  }

  async onSubmitCoordinate(): Promise<void> {
    if (this.formGroup.valid) {
    } else {
      this.formGroup.markAllAsTouched();
      this.formGroup.updateValueAndValidity();
    }
  }

  onClear(): void {
    this.formGroup.reset();
    this.locations = [];
  }

  onView(location: LocationResponse) {
    this.stateService.setCenterState({
      lat: location.center[0],
      lng: location.center[1],
    });
    this.stateService.setZoomState(12);
  }
}
