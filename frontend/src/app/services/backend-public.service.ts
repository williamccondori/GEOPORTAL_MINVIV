import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { BaseLayer } from '../models/base-layer.model';
import { InitialSettings } from '../models/initial-settings.model';
import { LocationRequest, LocationResponse } from '../models/location.model';
import { WebMapServiceInformation } from '../models/wms-info.model';

import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class BackendPublicService {
  private readonly apiService = inject(ApiService);

  getInitialSettings(): Observable<InitialSettings> {
    return this.apiService.get<InitialSettings>(`initial-settings`);
  }

  // Base layers

  getAllBaseLayers(): Observable<BaseLayer[]> {
    return this.apiService.get<BaseLayer[]>(`base-layers`);
  }

  getWmsInformation(url: string): Observable<WebMapServiceInformation> {
    return this.apiService.get<WebMapServiceInformation>(
      `wms-layers?url=${encodeURIComponent(url)}`
    );
  }

  getAllLocations(
    locationRequest: LocationRequest
  ): Observable<LocationResponse[]> {
    return this.apiService.get<LocationResponse[]>(
      `locations?query=${encodeURIComponent(locationRequest.query)}`
    );
  }
}
