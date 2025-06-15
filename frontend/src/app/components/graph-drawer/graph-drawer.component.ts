import {Component, inject} from '@angular/core';
import {Observable} from 'rxjs';
import {StateService} from '../../services/state.service';
import {AsyncPipe} from '@angular/common';
import {DrawerModule} from 'primeng/drawer';

@Component({
  selector: 'app-graph-drawer',
  imports: [
    AsyncPipe,
    DrawerModule
  ],
  templateUrl: './graph-drawer.component.html',
  styleUrl: './graph-drawer.component.css'
})
export class GraphDrawerComponent {
  private readonly stateService = inject(StateService);

  get isVisible(): Observable<boolean> {
    return this.stateService.graphDrawerState$;
  }

  onHide(): void {
    this.stateService.setGraphDrawerState(false);
  }

  onDrawerOpen(): void {

  }
}
