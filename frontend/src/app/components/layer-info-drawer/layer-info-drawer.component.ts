import {AsyncPipe} from '@angular/common';
import {Component, effect, inject} from '@angular/core';

import {CardModule} from 'primeng/card';
import {DrawerModule} from 'primeng/drawer';

import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {SelectModule} from 'primeng/select';
import {LayerService} from '../../services/layer.service';
import {StateService} from '../../services/state.service';
import {ActiveWmsLayer} from '../../models/layer.model';
import {Observable} from 'rxjs';
import {SliderModule} from 'primeng/slider';
import {ButtonModule} from 'primeng/button';
import {TooltipModule} from 'primeng/tooltip';
import {ButtonGroupModule} from 'primeng/buttongroup';
import {FieldsetModule} from 'primeng/fieldset';
import {TableModule} from 'primeng/table';
import {ImageModule} from 'primeng/image';

interface LayerInformationItem {
  property: string;
  value: string | number;
}

@Component({
  standalone: true,
  selector: 'app-layer-info-drawer',
  imports: [
    DrawerModule,
    AsyncPipe,
    CardModule,
    SelectModule,
    ReactiveFormsModule,
    SliderModule,
    ButtonModule,
    TooltipModule,
    FieldsetModule,
    ButtonGroupModule,
    TableModule,
    ImageModule,
  ],
  templateUrl: './layer-info-drawer.component.html',
  styleUrl: './layer-info-drawer.component.css',
})
export class LayerInfoDrawerComponent {
  private readonly stateService = inject(StateService);
  readonly layerService = inject(LayerService);

  activeWmsLayer: ActiveWmsLayer | null = null;
  formGroup: FormGroup;
  layerInformation: LayerInformationItem[] = [];

  constructor(private readonly fb: FormBuilder) {
    this.formGroup = this.fb.group({
      activeLayerId: [null],
      opacity: [1],
    });

    this.formGroup.get('activeLayerId')?.valueChanges.subscribe((layerId) => {
      const activeLayer = this.layerService.activeLayers().find((layer) => layer.id === layerId);
      if (activeLayer) {
        this.activeWmsLayer = activeLayer;
        this.updateLayerInformation(activeLayer);
        // Update the opacity form control with the selected layer's opacity
        this.formGroup.get('opacity')?.setValue(activeLayer.opacity, {emitEvent: false});
      } else {
        this.activeWmsLayer = null;
        this.layerInformation = [];
      }
    });

    // Subscribe to opacity changes and update the layer
    this.formGroup.get('opacity')?.valueChanges.subscribe((opacity) => {
      if (this.activeWmsLayer && opacity !== null) {
        this.onOpacityChange(this.activeWmsLayer.id, opacity);
      }
    });

    // Watch for changes in active layers to clear selection if layer is removed
    effect(() => {
      const activeLayers = this.layerService.activeLayers();
      const currentSelectedId = this.formGroup.get('activeLayerId')?.value;
      if (currentSelectedId) {
        const stillExists = activeLayers.some((layer) => layer.id === currentSelectedId);
        if (!stillExists) {
          this.formGroup.get('activeLayerId')?.setValue(null, {emitEvent: false});
          this.activeWmsLayer = null;
          this.layerInformation = [];
        }
      }
    });
  }

  onOpacityChange(id: string, opacity: number): void {
    this.layerService.updateOpacity(id, opacity);
  }

  onMoveToFront(id: string): void {
    this.layerService.moveLayerToFront(id);
  }

  onMoveToBack(id: string): void {
    this.layerService.moveLayerToBack(id);
  }

  onMoveUp(id: string): void {
    this.layerService.moveLayerUp(id);
  }

  onMoveDown(id: string): void {
    this.layerService.moveLayerDown(id);
  }

  onRemoveActiveLayer(id: string): void {
    this.layerService.onDeleteActiveLayer(id);
    // Clear the form selection
    this.formGroup.get('activeLayerId')?.setValue(null, {emitEvent: false});
    this.activeWmsLayer = null;
    this.layerInformation = [];
  }

  get isVisible(): Observable<boolean> {
    return this.stateService.layerInfoDrawerState$;
  }

  onHide(): void {
    this.stateService.setLayerInfoDrawerState(false);
  }

  private updateLayerInformation(layer: ActiveWmsLayer): void {
    this.layerInformation = [
      {property: 'ID', value: layer.id},
      {property: 'Nombre', value: layer.name},
      {property: 'Título', value: layer.title},
      {property: 'URL', value: layer.url},
    ];
  }

  getLegendUrl(layer: ActiveWmsLayer): string {
    if (!layer?.url || !layer?.name) return '';

    const baseUrl = layer.url.endsWith('?') ? layer.url : `${layer.url}?`;
    const legendParams = new URLSearchParams({
      service: 'WMS',
      version: '1.1.0',
      request: 'GetLegendGraphic',
      layer: layer.name,
      format: 'image/png',
    });

    return `${baseUrl}${legendParams.toString()}`;
  }
}
