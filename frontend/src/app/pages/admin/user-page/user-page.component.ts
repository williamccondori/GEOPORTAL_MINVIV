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

import { UserFormComponent } from '../../../components/admin/user-form/user-form.component';
import { Constants } from '../../../models/constants';
import { User } from '../../../models/user.model';
import { BackendService } from '../../../services/backend.service';
import { StateService } from '../../../services/state.service';

@Component({
  standalone: true,
  selector: 'app-user-page',
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
  templateUrl: './user-page.component.html',
})
export class UserPageComponent implements OnInit, OnDestroy {
  private readonly stateService = inject(StateService);
  private readonly dialogService = inject(DialogService);
  private readonly messageService = inject(MessageService);
  private readonly backendService = inject(BackendService);
  private readonly confirmationService = inject(ConfirmationService);

  private dialogSubscription?: Subscription;

  users: User[] = [];

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

  onOpenForm(userId?: string) {
    const dialog = this.dialogService.open(UserFormComponent, {
      header: userId ? 'Actualizar usuario' : 'Agregar usuario',
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
        id: userId,
      },
    });

    this.dialogSubscription = dialog.onClose.subscribe(async (user: User) => {
      if (user) {
        try {
          this.stateService.setIsLoadingState(true);
          const command = userId
            ? this.backendService.updateUser(userId, user)
            : this.backendService.createUser(user);
          await this.getData();
          this.messageService.add({
            severity: 'success',
            summary: 'ÉXITO',
            detail: Constants.SUCCESS_MESSAGE,
          });
          await firstValueFrom(command);
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

  onDelete(userId: string) {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea eliminar este usuario?',
      header: 'Eliminar usuario',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        try {
          this.stateService.setIsLoadingState(true);
          await firstValueFrom(this.backendService.deleteUser(userId));
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
    this.users = await firstValueFrom(this.backendService.getAllUsers());
  }
}
