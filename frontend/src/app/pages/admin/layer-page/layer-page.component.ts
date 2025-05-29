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

import { LayerFormComponent } from '../../../components/admin/layer-form/layer-form.component';
import { Constants } from '../../../models/constants';
import { BackendService } from '../../../services/backend.service';
import { StateService } from '../../../services/state.service';

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

  layers: any[] = [];

  async ngOnInit() {
    try {
      this.stateService.setIsLoadingState(true);
      // await this.getAllOwners();
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

  onOpenForm(layerId?: string) {
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
  }

  onSearch($event: Event, table: Table) {
    return table.filterGlobal(
      ($event.target as HTMLInputElement).value,
      'contains'
    );
  }

  onDelete(layerId: string) {
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
          // await this.getAllOwners();
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
}
