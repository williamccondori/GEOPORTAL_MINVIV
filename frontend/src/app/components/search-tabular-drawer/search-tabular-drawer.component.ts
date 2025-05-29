import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';

import { Button } from 'primeng/button';
import { Drawer, DrawerModule } from 'primeng/drawer';
import { TableModule } from 'primeng/table';

import { StateService } from '../../services/state.service';

@Component({
  standalone: true,
  selector: 'app-search-tabular-drawer',
  imports: [DrawerModule, AsyncPipe, Button, TableModule],
  templateUrl: './search-tabular-drawer.component.html',
})
export class SearchTabularDrawerComponent {
  private readonly stateService = inject(StateService);

  houses: any[] = [];

  get isVisible() {
    return this.stateService.searchTabularDrawerState$;
  }

  onHide() {
    this.stateService.setSearchTabularDrawerState(false);
  }
}
