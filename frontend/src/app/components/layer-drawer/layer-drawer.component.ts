import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';

import { CardModule } from 'primeng/card';
import { DrawerModule } from 'primeng/drawer';

import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService, TreeNode } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { FieldsetModule } from 'primeng/fieldset';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { TreeSelectModule } from 'primeng/treeselect';
import { firstValueFrom, Observable } from 'rxjs';
import { CategoryNode } from '../../models/category.model';
import { Constants } from '../../models/constants';
import { ActiveWmsLayer, InternalLayer } from '../../models/layer.model';
import { BackendPublicService } from '../../services/backend-public.service';
import { LayerService } from '../../services/layer.service';
import { StateService } from '../../services/state.service';

@Component({
  standalone: true,
  selector: 'app-layer-drawer',
  imports: [
    DrawerModule,
    AsyncPipe,
    CardModule,
    TreeSelectModule,
    FieldsetModule,
    ButtonModule,
    ReactiveFormsModule,
    TableModule,
    TooltipModule,
  ],
  templateUrl: './layer-drawer.component.html',
})
export class LayerDrawerComponent implements OnInit {
  private readonly stateService = inject(StateService);
  private readonly messageService = inject(MessageService);
  private readonly layerService = inject(LayerService);
  private readonly backendPublicService = inject(BackendPublicService);
  private readonly confirmationService = inject(ConfirmationService);

  categoryNodes: CategoryNode[] = [];
  categoryTree: TreeNode<string>[] = [];
  layers: InternalLayer[] = [];
  selectedLayers: InternalLayer[] = [];

  formGroup: FormGroup = new FormGroup({
    categoryParent: new FormControl<TreeNode<string> | undefined>(
      {
        value: undefined,
        disabled: false,
      },
      [Validators.required],
    ),
  });

  ngOnInit(): void {
    this.formGroup
      .get('categoryParent')
      ?.valueChanges.subscribe(async (value: TreeNode<string> | undefined) => {
        this.layers = [];
        if (value) {
          try {
            this.stateService.setIsLoadingState(true);
            await this.getAllLayers(value.key!);
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
          this.formGroup.get('layerId')?.setValue('');
        }
      });
  }

  async onDrawerOpen(): Promise<void> {
    try {
      this.stateService.setIsLoadingState(true);
      await this.getCategoryStructure();
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

  onAddLayer(id: string): void {
    const existingLayer: InternalLayer | null =
      this.selectedLayers.find((layer) => layer.id === id) ?? null;
    if (!existingLayer) {
      this.selectedLayers.push(this.layers.find((layer) => layer.id === id) as InternalLayer);
    }
  }

  onDelete(id: string): void {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea eliminar esta capa del espacio de trabajo?',
      header: 'Eliminar capa del espacio de trabajo',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        const index = this.selectedLayers.findIndex((layer) => layer.id === id);
        if (index !== -1) {
          this.selectedLayers.splice(index, 1);
        }

        this.layerService.onDeleteActiveLayer(id);

        this.messageService.add({
          severity: 'success',
          summary: 'ÉXITO',
          detail: Constants.SUCCESS_MESSAGE,
        });
      },
    });
  }

  onShowLayer(id: string): void {
    const existingActiveLayer = this.layerService.activeLayers().find((layer) => layer.id === id);
    if (existingActiveLayer) {
      this.layerService.onDeleteActiveLayer(id);
    } else {
      const existingLayer = this.selectedLayers.find((layer) => layer.id === id);
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

  get isVisible(): Observable<boolean> {
    return this.stateService.layerDrawerState$;
  }

  getLayerIcon(id: string): string {
    const isActive = this.layerService.activeLayers().some((layer) => layer.id === id);
    return isActive ? 'pi pi-eye-slash' : 'pi pi-eye';
  }

  private getNextZIndex(): number {
    const activeLayers = this.layerService.activeLayers();
    if (activeLayers.length === 0) return 1;
    return Math.max(...activeLayers.map((layer) => layer.zIndex), 0) + 1;
  }

  onHide(): void {
    this.stateService.setLayerDrawerState(false);
  }

  async onSubmit(): Promise<void> {}

  private async getCategoryStructure(): Promise<void> {
    const categoryList = await firstValueFrom(this.backendPublicService.getCatalogStructure());
    this.categoryTree = this.convertToTree(categoryList);
  }

  private convertToTree(nodes: CategoryNode[]): TreeNode<string>[] {
    return nodes.map((node) => ({
      key: node.id.toString(),
      label: node.name,
      data: node.id,
      leaf: (node.children ?? []).length > 0,
      children: this.convertToTree(node.children ?? []),
    }));
  }

  private async getAllLayers(categoryId: string): Promise<void> {
    this.layers = await firstValueFrom(
      this.backendPublicService.getLayersByCategoryId(categoryId, false),
    );
  }
}
