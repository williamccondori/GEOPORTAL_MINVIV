import {Component, inject} from '@angular/core';
import {Observable} from 'rxjs';
import {StateService} from '../../services/state.service';
import {AsyncPipe} from '@angular/common';
import {DrawerModule} from 'primeng/drawer';

@Component({
  selector: 'app-summary-drawer',
  imports: [
    AsyncPipe,
    DrawerModule
  ],
  templateUrl: './summary-drawer.component.html',
  styleUrl: './summary-drawer.component.css'
})
export class SummaryDrawerComponent {
  private readonly stateService = inject(StateService);

  get isVisible(): Observable<boolean> {
    return this.stateService.summaryDrawerState$;
  }

  onHide(): void {
    this.stateService.setSummaryDrawerState(false);
  }

  onDrawerOpen(): void {

  }
}
