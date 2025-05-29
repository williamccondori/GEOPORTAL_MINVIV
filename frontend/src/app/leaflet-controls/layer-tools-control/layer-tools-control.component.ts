import { Component, inject } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

import { StateService } from '../../services/state.service';

@Component({
  standalone: true,
  selector: 'app-layer-tools-control',
  imports: [ButtonModule, TooltipModule],
  templateUrl: './layer-tools-control.component.html',
})
export class LayerToolsControlComponent {
  private readonly stateService = inject(StateService);

  onOpenLegendDrawer() {}

  onOpenLayerInfoDrawer() {
    this.stateService.setLayerInfoDrawerState(true);
  }
}
