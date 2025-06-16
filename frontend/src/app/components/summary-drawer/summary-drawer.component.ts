import {Component, inject, OnInit} from '@angular/core';
import {firstValueFrom, Observable} from 'rxjs';
import {StateService} from '../../services/state.service';
import {AsyncPipe, DecimalPipe} from '@angular/common';
import {DrawerModule} from 'primeng/drawer';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {SelectModule} from "primeng/select";
import {TreeSelectModule} from "primeng/treeselect";
import {MessageService, TreeNode} from 'primeng/api';
import {BackendPublicService} from '../../services/backend-public.service';
import {InternalLayer} from '../../models/layer.model';
import {Constants} from '../../models/constants';
import {CategoryNode} from '../../models/category.model';
import {CardModule} from 'primeng/card';

@Component({
  selector: 'app-summary-drawer',
  imports: [
    AsyncPipe,
    DrawerModule,
    FormsModule,
    ReactiveFormsModule,
    SelectModule,
    TreeSelectModule,
    CardModule,
    DecimalPipe
  ],
  templateUrl: './summary-drawer.component.html',
  styleUrl: './summary-drawer.component.css'
})
export class SummaryDrawerComponent implements OnInit {
  private readonly stateService = inject(StateService);
  private readonly messageService = inject(MessageService);
  private readonly backendPublicService = inject(BackendPublicService);

  categoryTree: TreeNode<string>[] = [];
  layers: InternalLayer[] = [];
  summaries: any[] = [];

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
    return this.stateService.summaryDrawerState$;
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
          const response = await firstValueFrom(this.backendPublicService.getSummary(value))
          this.summaries = response.summaries.map((s: any) => ({
            ...s,
            color: this.getRandomColor()
          }));
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
    this.stateService.setSummaryDrawerState(false);
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

  getRandomColor(): string {
    const colors = [
      '#F44336', '#E91E63', '#9C27B0',
      '#673AB7', '#3F51B5', '#2196F3',
      '#03A9F4', '#00BCD4', '#009688',
      '#4CAF50', '#8BC34A', '#CDDC39',
      '#FFC107', '#FF9800', '#FF5722'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}
