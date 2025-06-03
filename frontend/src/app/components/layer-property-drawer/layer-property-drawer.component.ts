import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DrawerModule } from 'primeng/drawer';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { map, Observable } from 'rxjs';
import { WebMapServiceFeature } from '../../models/layer.model';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-layer-property-drawer',
  imports: [DrawerModule, AsyncPipe, TabViewModule, TableModule],
  templateUrl: './layer-property-drawer.component.html',
})
export class LayerPropertyDrawerComponent {
  private readonly stateService = inject(StateService);

  get isVisible(): Observable<boolean> {
    return this.stateService.layerPropertyDrawerState$.pipe(map((state) => state.visible));
  }

  get sources(): Observable<WebMapServiceFeature[][]> {
    return this.stateService.layerPropertyDrawerState$.pipe(map((state) => state.data));
  }

  onHide(): void {
    this.stateService.setLayerPropertyDrawerState({
      visible: false,
      data: [],
    });
  }
}
