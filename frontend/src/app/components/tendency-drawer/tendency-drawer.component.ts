import {Component, inject} from '@angular/core';
import {Observable} from 'rxjs';
import {StateService} from '../../services/state.service';
import {DrawerModule} from 'primeng/drawer';
import {AsyncPipe} from '@angular/common';

@Component({
  selector: 'app-tendency-drawer',
  imports: [
    AsyncPipe,
    DrawerModule
  ],
  templateUrl: './tendency-drawer.component.html',
  styleUrl: './tendency-drawer.component.css'
})
export class TendencyDrawerComponent {
  private readonly stateService = inject(StateService);

  get isVisible(): Observable<boolean> {
    return this.stateService.tendencyDrawerState$;
  }

  onHide(): void {
    this.stateService.setTendencyDrawerState(false);
  }

  onDrawerOpen(): void {

  }
}
