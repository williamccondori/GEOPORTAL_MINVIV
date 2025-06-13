import {Component, inject, OnInit} from '@angular/core';

import {TagModule} from 'primeng/tag';

import {MapInformation} from '../../models/map.model';
import {StateService} from '../../services/state.service';

@Component({
  standalone: true,
  selector: 'app-coordinates-control',
  imports: [TagModule],
  templateUrl: './coordinates-control.component.html',
})
export class CoordinatesControlComponent implements OnInit {
  private readonly stateService = inject(StateService);

  mapInformation: MapInformation = {} as MapInformation;

  ngOnInit() {
    this.stateService.mapInformationState$.subscribe((state) => {
      if (state) {
        this.mapInformation = state;
      }
    });
  }

  get coordinates() {
    return this.mapInformation.latLng
      ? `${this.mapInformation.latLng[0].toFixed(4)}, ${this.mapInformation.latLng[1].toFixed(4)} [${this.mapInformation.zoom}]`
      : '';
  }
}
