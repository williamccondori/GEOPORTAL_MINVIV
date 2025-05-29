import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';

import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { DrawerModule } from 'primeng/drawer';
import { ToastModule } from 'primeng/toast';
import { firstValueFrom } from 'rxjs';

import { BaseLayer } from '../../models/base-layer.model';
import { Constants } from '../../models/constants';
import { BackendPublicService } from '../../services/backend-public.service';
import { StateService } from '../../services/state.service';
import { BaseLayerMapComponent } from '../base-layer-map/base-layer-map.component';

@Component({
  standalone: true,
  selector: 'app-base-layer-drawer',
  imports: [
    DrawerModule,
    AsyncPipe,
    BaseLayerMapComponent,
    CardModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './base-layer-drawer.component.html',
})
export class BaseLayerDrawerComponent {
  private readonly stateService = inject(StateService);
  private readonly messageService = inject(MessageService);
  private readonly backendPublicService = inject(BackendPublicService);

  baseLayers: BaseLayer[] = [];

  async onDrawerOpen() {
    try {
      this.stateService.setIsLoadingState(true);
      await this.getData();
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

  get isVisible() {
    return this.stateService.baseLayerDrawerState$;
  }

  onHide() {
    this.stateService.setBaseLayerDrawerState(false);
  }

  onSelect(baseLayer: BaseLayer) {
    this.stateService.setBaseLayerState(baseLayer);
    this.onHide();
  }

  private async getData() {
    this.baseLayers = await firstValueFrom(
      this.backendPublicService.getAllBaseLayers()
    );
  }
}
