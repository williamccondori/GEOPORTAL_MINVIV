import {Component, inject, OnDestroy, OnInit} from '@angular/core';

import {ConfirmationService, MessageService} from 'primeng/api';
import {ButtonModule} from 'primeng/button';
import {DialogService} from 'primeng/dynamicdialog';
import {firstValueFrom, Subscription} from 'rxjs';

import {CategoryFormComponent} from '../../../components/admin/category-form/category-form.component';
import {CategoryNodeComponent} from '../../../components/admin/category-node/category-node.component';
import {Category, CategoryNode, CategoryParameter} from '../../../models/category.model';
import {Constants} from '../../../models/constants';
import {BackendService} from '../../../services/backend.service';
import {StateService} from '../../../services/state.service';

@Component({
  selector: 'app-category-page',
  imports: [ButtonModule, CategoryNodeComponent],
  templateUrl: './category-page.component.html',
})
export class CategoryPageComponent implements OnInit, OnDestroy {
  private readonly dialogService = inject(DialogService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly stateService = inject(StateService);
  private readonly backendService = inject(BackendService);

  private dialogSubscription?: Subscription;

  categories: CategoryNode[] = [];

  async ngOnInit() {
    try {
      this.stateService.setIsLoadingState(true);
      await this.getCategoryStructure();
    } catch (error) {
      console.error(error);
      this.messageService.add({
        severity: 'error',
        summary: 'ERROR',
        detail: Constants.ERROR_MESSAGE,
      });
    } finally {
      this.stateService.setIsLoadingState(false);
    }
  }

  async onOpenForm(categoryId?: string, categoryParentId?: string) {
    const dialog = this.dialogService?.open(CategoryFormComponent, {
      header: categoryId ? 'Actualizar categoría' : 'Agregar categoría',
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
        id: categoryId,
        categoryId: categoryParentId,
      } as CategoryParameter,
    });

    this.dialogSubscription = dialog?.onClose.subscribe(async (category: Category) => {
      if (category) {
        try {
          this.stateService.setIsLoadingState(true);
          const command = categoryId
            ? this.backendService.updateCategory(categoryId, category)
            : this.backendService.createCategory(category);
          await firstValueFrom(command);
          await this.getCategoryStructure();
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

  onDelete(categoryId: string) {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea eliminar esta categoría?',
      header: 'Eliminar categoría',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        try {
          this.stateService.setIsLoadingState(true);
          await firstValueFrom(this.backendService.deleteCategory(categoryId));
          await this.getCategoryStructure();
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

  private async getCategoryStructure() {
    this.categories = await firstValueFrom(this.backendService.getCatalogStructure());
  }
}
