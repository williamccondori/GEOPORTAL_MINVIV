import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

import { MessageService, TreeNode } from 'primeng/api';
import { FieldsetModule } from 'primeng/fieldset';
import { TreeSelectModule } from 'primeng/treeselect';
import { firstValueFrom, Observable } from 'rxjs';
import { CategoryNode } from '../../models/category.model';
import { Constants } from '../../models/constants';
import {
  InternalLayer,
  LayerInformationFilter,
  LayerInformationTable,
} from '../../models/layer.model';
import { BackendPublicService } from '../../services/backend-public.service';
import { LayerService } from '../../services/layer.service';
import { StateService } from '../../services/state.service';

@Component({
  standalone: true,
  selector: 'app-search-drawer',
  imports: [
    DrawerModule,
    AsyncPipe,
    ButtonModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    SelectModule,
    TreeSelectModule,
    FieldsetModule,
  ],
  templateUrl: './search-drawer.component.html',
})
export class SearchDrawerComponent implements OnInit {
  private readonly stateService = inject(StateService);
  private readonly messageService = inject(MessageService);
  private readonly backendPublicService = inject(BackendPublicService);
  private readonly layerService = inject(LayerService);
  private readonly fb = inject(FormBuilder);

  categoryNodes: CategoryNode[] = [];
  categoryTree: TreeNode<string>[] = [];
  layers: InternalLayer[] = [];
  layerInformationTable: LayerInformationTable | null = null;
  filtersFormGroup: FormGroup = this.fb.group({});

  formGroup: FormGroup = new FormGroup({
    categoryParent: new FormControl<TreeNode<string> | undefined>(
      {
        value: undefined,
        disabled: false,
      },
      [Validators.required],
    ),
    layerId: new FormControl<string>('', [Validators.required]),
  });

  ngOnInit(): void {
    this.formGroup
      .get('categoryParent')
      ?.valueChanges.subscribe(async (value: TreeNode<string> | undefined) => {
        this.layers = [];
        this.clearForm();
        this.formGroup.get('layerId')?.setValue('');
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
        }
      });
    this.formGroup.get('layerId')?.valueChanges.subscribe(async (value: string) => {
      this.clearForm();
      if (value) {
        try {
          this.stateService.setIsLoadingState(true);
          await this.getLayerInformationTable(value);
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

  get isVisible(): Observable<boolean> {
    return this.stateService.searchDrawerState$;
  }

  onHide(): void {
    this.stateService.setSearchDrawerState(false);
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

  private async getLayerInformationTable(layerId: string): Promise<void> {
    const layerInformationTable = await firstValueFrom(
      this.backendPublicService.getLayerInformationTable(layerId),
    );
    if (layerInformationTable) {
      this.layerInformationTable = layerInformationTable;
      this.createFiltersForm(layerInformationTable.filters);
    } else {
      this.clearForm();
    }
  }

  private createFiltersForm(filters: LayerInformationFilter[]): void {
    const group: Record<string, FormControl> = {};
    filters.forEach((filter) => {
      group[filter.name] = new FormControl(null);
    });
    this.filtersFormGroup = this.fb.group(group);
  }

  onSubmitFilters(): void {
    if (this.filtersFormGroup.valid && this.layerInformationTable) {
      const formValues = this.filtersFormGroup.value;
    }
  }

  private clearForm(): void {
    this.layerInformationTable = null;
    this.filtersFormGroup = this.fb.group({});
  }
}
