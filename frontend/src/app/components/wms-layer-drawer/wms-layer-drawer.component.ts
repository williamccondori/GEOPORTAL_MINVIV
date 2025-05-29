import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { DrawerModule } from 'primeng/drawer';
import { DialogService } from 'primeng/dynamicdialog';
import { FieldsetModule } from 'primeng/fieldset';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { firstValueFrom, Observable } from 'rxjs';

import { Constants } from '../../models/constants';
import {
  WebMapServiceInformation,
  WebMapServiceInformationTable,
} from '../../models/wms-info.model';
import { BackendPublicService } from '../../services/backend-public.service';
import { StateService } from '../../services/state.service';
import { WmsLayerListComponent } from '../wms-layer-list/wms-layer-list.component';
import { LayerService } from '../../services/layer.service';
import { ActiveWmsLayer } from '../../models/layer.model';

@Component({
  standalone: true,
  selector: 'app-wms-layer-drawer',
  imports: [
    DrawerModule,
    AsyncPipe,
    FormsModule,
    InputTextModule,
    InputGroupModule,
    ButtonModule,
    FieldsetModule,
    TableModule,
    DividerModule,
    ToastModule,
    ReactiveFormsModule,
  ],
  providers: [DialogService, MessageService],
  templateUrl: './wms-layer-drawer.component.html',
})
export class WmsLayerDrawerComponent {
  private readonly stateService = inject(StateService);
  private readonly messageService = inject(MessageService);
  private readonly dialogService = inject(DialogService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly backendPublicService = inject(BackendPublicService);
  readonly layerService = inject(LayerService);

  formGroup: FormGroup = new FormGroup({
    url: new FormControl('', [
      Validators.required,
      Validators.pattern('^(https?|ftp)://[^\\s/$.?#].*\\.[^\\s]*$'),
    ]),
  });

  wmsInformation: WebMapServiceInformation = {} as WebMapServiceInformation;
  wmsInformationTable: WebMapServiceInformationTable[] = [];

  get isVisible(): Observable<boolean> {
    return this.stateService.wmsLayerDrawerState$;
  }

  onHide(): void {
    this.stateService.setWmsLayerDrawerState(false);
  }

  async onSubmit(): Promise<void> {
    try {
      if (this.formGroup.valid) {
        this.stateService.setIsLoadingState(true);
        const formValues = this.formGroup.getRawValue();
        this.wmsInformation = await firstValueFrom(
          this.backendPublicService.getWmsInformation(formValues.url)
        );
        this.wmsInformationTable = this.getWmsInformationTable(
          this.wmsInformation
        );
      } else {
        this.formGroup.markAllAsTouched();
        this.formGroup.updateValueAndValidity();
      }
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
  }

  onDelete(id: string): void {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea eliminar esta capa WMS?',
      header: 'Eliminar capa WMS',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        try {
          this.stateService.setIsLoadingState(true);
          this.layerService.onDeleteUserWmsLayer(id);
          this.messageService.add({
            severity: 'success',
            summary: 'ÉXITO',
            detail: Constants.SUCCESS_MESSAGE,
          });
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
      },
    });
  }

  getLayerIcon(id: string): string {
    const isActive = this.layerService
      .activeLayers()
      .some(layer => layer.id === id);
    return isActive ? 'pi pi-eye-slash' : 'pi pi-eye';
  }

  private getNextZIndex(): number {
    const activeLayers = this.layerService.activeLayers();
    if (activeLayers.length === 0) return 1;
    return Math.max(...activeLayers.map(layer => layer.zIndex), 0) + 1;
  }

  onShowLayer(id: string): void {
    const existingActiveLayer = this.layerService
      .activeLayers()
      .find(layer => layer.id === id);
    if (existingActiveLayer) {
      this.layerService.onDeleteActiveLayer(id);
    } else {
      const existingLayer = this.layerService
        .userWmslayers()
        .find(layer => layer.id === id);
      if (existingLayer) {
        this.layerService.onAddActiveLayer({
          id: existingLayer.id,
          name: existingLayer.name,
          title: existingLayer.title,
          url: existingLayer.url,
          opacity: 1,
          zIndex: this.getNextZIndex(),
        } as ActiveWmsLayer);
      }
    }
  }

  onShowLayers(): void {
    this.dialogService.open(WmsLayerListComponent, {
      header: `Capas disponibles (${this.wmsInformation.layers.length})`,
      width: '40vw',
      modal: true,
      breakpoints: {
        '1200px': '40vw',
        '960px': '50vw',
        '640px': '90vw',
        '480px': '90vw',
      },
      closable: true,
      data: {
        url: this.wmsInformation.url,
        layers: this.wmsInformation.layers,
      },
    });
  }

  private getWmsInformationTable(
    wmsInformation: WebMapServiceInformation
  ): WebMapServiceInformationTable[] {
    return [
      { key: 'URL', value: wmsInformation.url },
      { key: 'Nombre', value: wmsInformation.name },
      { key: 'Título', value: wmsInformation.title },
      { key: 'Versión', value: wmsInformation.version },
      { key: 'Descripción', value: wmsInformation.description },
      { key: 'Palabras clave', value: wmsInformation.keywords.join(', ') },
      {
        key: 'Operaciones disponibles',
        value: wmsInformation.operations.join(', '),
      },
    ];
  }
}
