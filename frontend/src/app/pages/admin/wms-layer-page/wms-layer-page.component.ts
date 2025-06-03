import { Component, inject, OnDestroy, OnInit } from '@angular/core';

import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { firstValueFrom, Subscription } from 'rxjs';

import { WmsLayerFormComponent } from '../../../components/admin/wms-layer-form/wms-layer-form.component';
import { Constants } from '../../../models/constants';
import { WmsLayer } from '../../../models/wms-layer.model';
import { BackendService } from '../../../services/backend.service';
import { StateService } from '../../../services/state.service';

@Component({
  standalone: true,
  selector: 'app-wms-layer-page',
  imports: [
    ButtonModule,
    TableModule,
    ToastModule,
    ConfirmDialogModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
  ],
  providers: [DialogService, MessageService, ConfirmationService],
  templateUrl: './wms-layer-page.component.html',
})
export class WmsLayerPageComponent implements OnInit, OnDestroy {
  private readonly stateService = inject(StateService);
  private readonly dialogService = inject(DialogService);
  private readonly messageService = inject(MessageService);
  private readonly backendService = inject(BackendService);
  private readonly confirmationService = inject(ConfirmationService);

  private dialogSubscription?: Subscription;

  wmsLayers: WmsLayer[] = [];

  async ngOnInit() {
    try {
      this.stateService.setIsLoadingState(true);
      await this.getData();
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

  onOpenForm(wmsLayerId?: string) {
    const dialog = this.dialogService.open(WmsLayerFormComponent, {
      header: wmsLayerId ? 'Actualizar capa WMS' : 'Agregar capa WMS',
      width: '30vw',
      modal: true,
      breakpoints: {
        '1400px': '35vw',
        '1200px': '40vw',
        '960px': '50vw',
        '640px': '80vw',
        '480px': '95vw',
      },
      closable: true,
      data: {
        id: wmsLayerId,
      },
    });

    this.dialogSubscription = dialog.onClose.subscribe(async (wmsLayer: WmsLayer) => {
      if (wmsLayer) {
        try {
          this.stateService.setIsLoadingState(true);
          const command = wmsLayerId
            ? this.backendService.updateWmsLayer(wmsLayerId, wmsLayer)
            : this.backendService.createWmsLayer(wmsLayer);
          await firstValueFrom(command);
          await this.getData();
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
      }
    });
  }

  onDelete(wmsLayerId: string) {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea eliminar esta capa WMS?',
      header: 'Eliminar capa WMS',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        try {
          this.stateService.setIsLoadingState(true);
          await firstValueFrom(this.backendService.deleteWmsLayer(wmsLayerId));
          await this.getData();
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

  ngOnDestroy() {
    if (this.dialogSubscription) {
      this.dialogSubscription.unsubscribe();
    }
  }

  onSearch($event: Event, table: Table) {
    return table.filterGlobal(($event.target as HTMLInputElement).value, 'contains');
  }

  private async getData() {
    this.wmsLayers = await firstValueFrom(this.backendService.getAllWmsLayers());
  }
}
