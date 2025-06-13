import {Component, inject, OnDestroy, OnInit} from '@angular/core';

import {ConfirmationService, MessageService} from 'primeng/api';
import {ButtonModule} from 'primeng/button';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {DialogService} from 'primeng/dynamicdialog';
import {IconFieldModule} from 'primeng/iconfield';
import {InputIconModule} from 'primeng/inputicon';
import {InputTextModule} from 'primeng/inputtext';
import {Table, TableModule} from 'primeng/table';
import {ToastModule} from 'primeng/toast';
import {firstValueFrom, Subscription} from 'rxjs';

import {BaseLayerFormComponent} from '../../../components/admin/base-layer-form/base-layer-form.component';
import {BaseLayer} from '../../../models/base-layer.model';
import {Constants} from '../../../models/constants';
import {BackendService} from '../../../services/backend.service';
import {StateService} from '../../../services/state.service';

@Component({
  standalone: true,
  selector: 'app-base-layer-page',
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
  templateUrl: './base-layer-page.component.html',
})
export class BaseLayerPageComponent implements OnInit, OnDestroy {
  private readonly stateService = inject(StateService);
  private readonly dialogService = inject(DialogService);
  private readonly messageService = inject(MessageService);
  private readonly backendService = inject(BackendService);
  private readonly confirmationService = inject(ConfirmationService);

  private dialogSubscription?: Subscription;

  baseLayers: BaseLayer[] = [];

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

  onOpenForm(baseLayerId?: string) {
    const dialog = this.dialogService.open(BaseLayerFormComponent, {
      header: baseLayerId ? 'Actualizar capa base' : 'Agregar capa base',
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
        id: baseLayerId,
      },
    });

    this.dialogSubscription = dialog.onClose.subscribe(async (baseLayer: BaseLayer) => {
      if (baseLayer) {
        try {
          this.stateService.setIsLoadingState(true);
          const command = baseLayerId
            ? this.backendService.updateBaseLayer(baseLayerId, baseLayer)
            : this.backendService.createBaseLayer(baseLayer);
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

  onDelete(baseLayerId: string) {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea eliminar esta capa base?',
      header: 'Eliminar capa base',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        try {
          this.stateService.setIsLoadingState(true);
          await firstValueFrom(this.backendService.deleteBaseLayer(baseLayerId));
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

  onSearch($event: Event, table: Table) {
    return table.filterGlobal(($event.target as HTMLInputElement).value, 'contains');
  }

  ngOnDestroy() {
    if (this.dialogSubscription) {
      this.dialogSubscription.unsubscribe();
    }
  }

  private async getData() {
    this.baseLayers = await firstValueFrom(this.backendService.getAllBaseLayers());
  }
}
