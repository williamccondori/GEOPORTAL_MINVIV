import {Component, inject} from '@angular/core';

import {ButtonModule} from 'primeng/button';
import {DialogService} from 'primeng/dynamicdialog';
import {TooltipModule} from 'primeng/tooltip';

import {ShareFormComponent} from '../../components/share-form/share-form.component';
import {StateService} from '../../services/state.service';

@Component({
  standalone: true,
  selector: 'app-tools-control',
  imports: [ButtonModule, TooltipModule],
  providers: [DialogService],
  templateUrl: './tools-control.component.html',
})
export class ToolsControlComponent {
  private readonly stateService = inject(StateService);
  private readonly dialogService = inject(DialogService);

  onOpenSearchDrawer() {
    this.stateService.setSearchDrawerState(true);
  }

  onOpenSearchTabularDrawer() {
    this.stateService.setSearchTabularDrawerState(true);
  }

  onOpenViewDrawer() {
    this.stateService.setViewDrawerState(true);
  }

  onOpenBaseLayerDrawer() {
    this.stateService.setBaseLayerDrawerState(true);
  }

  onOpenChatbotDrawer() {
    this.stateService.setChatbotDrawerState(true);
  }

  onOpenWmsLayerDrawer() {
    this.stateService.setWmsLayerDrawerState(true);
  }

  onOpenLocationDrawer() {
    this.stateService.setLocationDrawerState(true);
  }

  onOpenLayerDrawer() {
    this.stateService.setLayerDrawerState(true);
  }

  onShare() {
    this.dialogService.open(ShareFormComponent, {
      header: 'Compartir',
      width: '30vw',
      modal: true,
      breakpoints: {
        '1400px': '35vw',
        '1200px': '40vw',
        '960px': '50vw',
        '640px': '80vw',
        '480px': '95vw',
      },
      closable: true,
    });
  }
}
