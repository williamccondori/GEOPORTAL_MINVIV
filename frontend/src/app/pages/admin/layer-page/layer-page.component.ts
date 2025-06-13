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

import {LayerFormComponent} from '../../../components/admin/layer-form/layer-form.component';
import {Constants} from '../../../models/constants';
import {Layer, LayerForm} from '../../../models/layer.model';
import {BackendService} from '../../../services/backend.service';
import {StateService} from '../../../services/state.service';
import {TagModule} from 'primeng/tag';

@Component({
  selector: 'app-layer-page',
  imports: [
    ButtonModule,
    ConfirmDialogModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    TableModule,
    ToastModule,
    TagModule,
  ],
  templateUrl: './layer-page.component.html',
})
export class LayerPageComponent implements OnInit, OnDestroy {
  private readonly dialogService = inject(DialogService);
  private readonly messageService = inject(MessageService);
  private readonly backendService = inject(BackendService);
  private readonly stateService = inject(StateService);
  private readonly confirmationService = inject(ConfirmationService);

  private dialogSubscription?: Subscription;

  layers: Layer[] = [];

  ngOnInit(): void {
    this.initComponent();
  }

  onOpenForm(layerId?: string): void {
    const dialog = this.dialogService.open(LayerFormComponent, {
      header: layerId ? 'Actualizar capa' : 'Agregar capa',
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
        id: layerId,
      },
    });

    this.dialogSubscription = dialog.onClose.subscribe(async (layerForm: LayerForm) => {
      if (layerForm) {
        try {
          this.stateService.setIsLoadingState(true);
          const command = layerId
            ? this.backendService.updateLayer(layerId, layerForm)
            : this.backendService.createLayer(layerForm);
          await firstValueFrom(command);
          await this.getAllLayers();
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

  onSearch($event: Event, table: Table): void {
    return table.filterGlobal(($event.target as HTMLInputElement).value, 'contains');
  }

  onDelete(layerId: string): void {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea eliminar esta capa?',
      header: 'Eliminar capa',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        try {
          this.stateService.setIsLoadingState(true);
          await firstValueFrom(this.backendService.deleteLayer(layerId));
          await this.getAllLayers();
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

  ngOnDestroy(): void {
    if (this.dialogSubscription) {
      this.dialogSubscription.unsubscribe();
    }
  }

  private async initComponent(): Promise<void> {
    try {
      this.stateService.setIsLoadingState(true);
      this.getAllLayers();
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

  private async getAllLayers(): Promise<void> {
    this.layers = await firstValueFrom(this.backendService.getAllLayers());
  }
}
