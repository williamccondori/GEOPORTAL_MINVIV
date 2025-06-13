import {AsyncPipe} from '@angular/common';
import {Component, inject, OnDestroy} from '@angular/core';

import {ConfirmationService, MessageService} from 'primeng/api';
import {ButtonModule} from 'primeng/button';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {DrawerModule} from 'primeng/drawer';
import {DialogService} from 'primeng/dynamicdialog';
import {TableModule} from 'primeng/table';
import {Subscription} from 'rxjs';

import {Constants} from '../../models/constants';
import {View} from '../../models/view.model';
import {StateService} from '../../services/state.service';
import {ViewFormComponent} from '../view-form/view-form.component';

@Component({
  standalone: true,
  selector: 'app-view-drawer',
  imports: [DrawerModule, ButtonModule, TableModule, AsyncPipe, ConfirmDialogModule],
  providers: [DialogService, ConfirmationService, MessageService],
  templateUrl: './view-drawer.component.html',
})
export class ViewDrawerComponent implements OnDestroy {
  private readonly stateService = inject(StateService);
  private readonly dialogService = inject(DialogService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  private dialogSubscription?: Subscription;

  views: View[] = [];

  onAdd() {
    const dialog = this.dialogService.open(ViewFormComponent, {
      header: 'Agregar marcador',
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
    });

    this.dialogSubscription = dialog.onClose.subscribe((view: View) => {
      if (view) {
        this.views.push(view);
      }
    });
  }

  get isVisible() {
    return this.stateService.viewDrawerState$;
  }

  onHide() {
    this.stateService.setViewDrawerState(false);
  }

  onView(view: View) {
    this.stateService.setCenterState({
      lat: view.latitude,
      lng: view.longitude,
    });
    this.stateService.setZoomState(view.zoom);
  }

  onDelete(view: View) {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea eliminar este marcador?',
      header: 'Eliminar marcador',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        try {
          this.stateService.setIsLoadingState(true);
          this.views = this.views.filter((x) => x.id !== view.id);
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
