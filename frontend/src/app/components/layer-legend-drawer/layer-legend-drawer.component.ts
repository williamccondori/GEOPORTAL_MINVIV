import { AsyncPipe } from '@angular/common';
import { Component, inject, Signal } from '@angular/core';
import { DrawerModule } from 'primeng/drawer';
import { FieldsetModule } from 'primeng/fieldset';
import { Observable } from 'rxjs';
import { ActiveWmsLayer } from '../../models/layer.model';
import { LayerService } from '../../services/layer.service';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-layer-legend-drawer',
  imports: [DrawerModule, AsyncPipe, FieldsetModule],
  templateUrl: './layer-legend-drawer.component.html',
  styleUrls: ['./layer-legend-drawer.component.css'],
})
export class LayerLegendDrawerComponent {
  private readonly stateService = inject(StateService);
  private readonly layerService = inject(LayerService);

  get isVisible(): Observable<boolean> {
    return this.stateService.layerLegendDrawerState$;
  }

  get activeLayers(): Signal<ActiveWmsLayer[]> {
    return this.layerService.activeLayers;
  }

  onHide(): void {
    this.stateService.setLayerLegendDrawerState(false);
  }

  getLegendUrl(layer: ActiveWmsLayer): string {
    const baseUrl = layer.url;
    const params = new URLSearchParams({
      service: 'WMS',
      version: '1.1.0',
      request: 'GetLegendGraphic',
      layer: layer.name,
      format: 'image/png',
    });
    return `${baseUrl}?${params.toString()}`;
  }
}
