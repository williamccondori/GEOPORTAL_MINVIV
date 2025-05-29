import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';

import { CardModule } from 'primeng/card';
import { DrawerModule } from 'primeng/drawer';

import { StateService } from '../../services/state.service';

@Component({
  standalone: true,
  selector: 'app-layer-drawer',
  imports: [DrawerModule, AsyncPipe, CardModule],
  templateUrl: './layer-drawer.component.html',
})
export class LayerDrawerComponent {
  private readonly stateService = inject(StateService);

  onDrawerOpen() {}

  get isVisible() {
    return this.stateService.layerDrawerState$;
  }

  onHide() {
    this.stateService.setLayerDrawerState(false);
  }
}
