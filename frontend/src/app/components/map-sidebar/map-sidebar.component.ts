import {Component, inject} from '@angular/core';
import {TooltipModule} from 'primeng/tooltip';
import {StateService} from '../../services/state.service';

@Component({
  selector: 'app-map-sidebar',
  imports: [TooltipModule],
  templateUrl: './map-sidebar.component.html',
  styleUrl: './map-sidebar.component.css',
})
export class MapSidebarComponent {
  private readonly stateService = inject(StateService);

  openSummary(): void {
    this.stateService.setSummaryDrawerState(true);
  }

  openGraph(): void {
    this.stateService.setGraphDrawerState(true);
  }

  openTendency(): void {
    this.stateService.setTendencyDrawerState(true);
  }
}
