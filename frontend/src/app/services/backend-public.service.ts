import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { BaseLayer } from '../models/base-layer.model';
import { InitialSettings } from '../models/initial-settings.model';
import { LocationRequest, LocationResponse } from '../models/location.model';
import { WebMapServiceInformation } from '../models/wms-info.model';

import { CategoryNode } from '../models/category.model';
import {
  InternalLayer,
  LayerInformationTable,
  WebMapServiceFeature,
  WebMapServiceFeatureRequest,
} from '../models/layer.model';
import { ApiService } from './api.service';
import { ChatResponse } from '../models/chatbot.model';

@Injectable({
  providedIn: 'root',
})
export class BackendPublicService {
  private readonly apiService = inject(ApiService);

  getInitialSettings(): Observable<InitialSettings> {
    return this.apiService.get<InitialSettings>(`initial-settings/`);
  }

  // Base layers

  getAllBaseLayers(): Observable<BaseLayer[]> {
    return this.apiService.get<BaseLayer[]>(`base-layers/`);
  }

  getWmsInformation(url: string): Observable<WebMapServiceInformation> {
    return this.apiService.get<WebMapServiceInformation>(
      `wms-layers/?url=${encodeURIComponent(url)}`
    );
  }

  getWmsFeatureInformation(
    request: WebMapServiceFeatureRequest
  ): Observable<WebMapServiceFeature[]> {
    return this.apiService.get<WebMapServiceFeature[]>(
      `wms-layers/features/`,
      request
    );
  }

  getAllLocations(
    locationRequest: LocationRequest
  ): Observable<LocationResponse[]> {
    return this.apiService.get<LocationResponse[]>(
      `locations/?query=${encodeURIComponent(locationRequest.query)}`
    );
  }

  getCatalogStructure(): Observable<CategoryNode[]> {
    return this.apiService.get<CategoryNode[]>(`categories/structure/`);
  }

  getLayersByCategoryId(
    categoryId: string,
    includeWmsLayers: boolean
  ): Observable<InternalLayer[]> {
    return this.apiService.get<InternalLayer[]>(
      `layers/?categoryId=${encodeURIComponent(categoryId)}&includeWmsLayers=${includeWmsLayers}`
    );
  }

  getLayerInformationTable(layerId: string): Observable<LayerInformationTable> {
    return this.apiService.get<LayerInformationTable>(
      `layers/${layerId}/tables/`
    );
  }

  getQuery(formData: FormData): Observable<ChatResponse[]> {
    return this.apiService.post<ChatResponse[]>(`chats/queries/`, formData);
  }

  getVoiceQuery(formData: FormData): Observable<ChatResponse[]> {
    return this.apiService.post<ChatResponse[]>(
      `chats/voice-queries/`,
      formData
    );
  }
}
