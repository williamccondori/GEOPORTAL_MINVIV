import {Component, inject, OnInit} from '@angular/core';
import {firstValueFrom, Observable} from 'rxjs';
import {StateService} from '../../services/state.service';
import {DrawerModule} from 'primeng/drawer';
import {AsyncPipe} from '@angular/common';
import {BackendPublicService} from '../../services/backend-public.service';
import {Constants} from '../../models/constants';
import {CategoryNode} from '../../models/category.model';
import {MessageService, TreeNode} from 'primeng/api';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {InternalLayer} from '../../models/layer.model';
import {SelectModule} from 'primeng/select';
import {TreeSelectModule} from 'primeng/treeselect';
import {ChartModule} from 'primeng/chart';
import {ChartData, ChartOptions} from 'chart.js';
import {CardModule} from 'primeng/card';
import {MessageModule} from 'primeng/message';

@Component({
  selector: 'app-tendency-drawer',
  imports: [
    AsyncPipe,
    DrawerModule,
    FormsModule,
    ReactiveFormsModule,
    SelectModule,
    TreeSelectModule,
    ChartModule,
    CardModule,
    MessageModule
  ],
  templateUrl: './tendency-drawer.component.html',
  styleUrl: './tendency-drawer.component.css'
})
export class TendencyDrawerComponent implements OnInit {
  private readonly stateService = inject(StateService);
  private readonly messageService = inject(MessageService);
  private readonly backendPublicService = inject(BackendPublicService);

  regressionData: ChartData | undefined;
  clustersData: ChartData | undefined;
  pcaData: ChartData | undefined;

  regressionOptions: ChartOptions = {responsive: true};
  clustersOptions: ChartOptions = {responsive: true};
  pcaOptions: ChartOptions = {responsive: true};

  categoryTree: TreeNode<string>[] = [];
  layers: InternalLayer[] = [];

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

  get isVisible(): Observable<boolean> {
    return this.stateService.tendencyDrawerState$;
  }

  ngOnInit(): void {
    this.formGroup
      .get('categoryParent')
      ?.valueChanges.subscribe(async (value: TreeNode<string> | undefined) => {
      this.layers = [];
      this.clear();
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
    this.formGroup
      .get('layerId')
      ?.valueChanges.subscribe(async (value: string) => {
      this.clear();
      if (value) {
        try {
          this.stateService.setIsLoadingState(true);
          this.regressionData = undefined;
          this.clustersData = undefined;
          this.pcaData = undefined;
          const response = await firstValueFrom(this.backendPublicService.getTendencies(value))
          const tendencies = response.tendencies;

          if (tendencies) {
            // 1) Regresión lineal (línea + puntos)
            this.regressionData = {
              datasets: [
                {
                  label: 'Datos Reales',
                  data: tendencies[0].original_data,
                  type: 'scatter',
                  backgroundColor: '#1976D2',
                  pointRadius: 5
                },
                {
                  label: tendencies[0].label,
                  data: tendencies[0].data,
                  type: 'line',
                  borderColor: tendencies[0].borderColor,
                  fill: false,
                  tension: 0.1
                }
              ]
            };

            // 2) Clusters scatter
            this.clustersData = {
              datasets: [{
                label: tendencies[1].label,
                data: tendencies[1].data,
                backgroundColor: tendencies[1].backgroundColor,
                pointRadius: 5
              }]
            };

            // 3) PCA scatter
            this.pcaData = {
              datasets: [{
                label: tendencies[2].label,
                data: tendencies[2].data,
                backgroundColor: tendencies[2].backgroundColor,
                pointRadius: 5
              }]
            };
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
    });
  }

  onHide(): void {
    this.stateService.setTendencyDrawerState(false);
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
    const categoryList = await firstValueFrom(
      this.backendPublicService.getCatalogStructure(),
    );
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

  private clear(): void {

  }
}
