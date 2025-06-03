import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { BaseLayer } from '../models/base-layer.model';
import { WebMapServiceFeature } from '../models/layer.model';
import { MapInformation } from '../models/map.model';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  private mapInformationStateSubject = new BehaviorSubject<MapInformation | null>(null);
  mapInformationState$ = this.mapInformationStateSubject.asObservable();

  setMapInformationState(mapInformation: MapInformation): void {
    this.mapInformationStateSubject.next(mapInformation);
  }

  private isLoadingStateSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingStateSubject.asObservable();

  setIsLoadingState(isLoading: boolean): void {
    this.isLoadingStateSubject.next(isLoading);
  }

  // Drawer states.

  private searchDrawerStateSubject = new BehaviorSubject<boolean>(false);
  searchDrawerState$ = this.searchDrawerStateSubject.asObservable();
  private searchTabularDrawerStateSubject = new BehaviorSubject<boolean>(false);
  searchTabularDrawerState$ = this.searchTabularDrawerStateSubject.asObservable();
  private viewDrawerStateSubject = new BehaviorSubject<boolean>(false);
  viewDrawerState$ = this.viewDrawerStateSubject.asObservable();
  private baseLayerDrawerStateSubject = new BehaviorSubject<boolean>(false);
  baseLayerDrawerState$ = this.baseLayerDrawerStateSubject.asObservable();
  private chatbotDrawerStateSubject = new BehaviorSubject<boolean>(false);
  chatbotDrawerState$ = this.chatbotDrawerStateSubject.asObservable();
  private wmsLayerDrawerStateSubject = new BehaviorSubject<boolean>(false);
  wmsLayerDrawerState$ = this.wmsLayerDrawerStateSubject.asObservable();
  private locationDrawerStateSubject = new BehaviorSubject<boolean>(false);
  locationDrawerState$ = this.locationDrawerStateSubject.asObservable();
  private layerDrawerStateSubject = new BehaviorSubject<boolean>(false);
  layerDrawerState$ = this.layerDrawerStateSubject.asObservable();
  private layerInfoDrawerStateSubject = new BehaviorSubject<boolean>(false);
  layerInfoDrawerState$ = this.layerInfoDrawerStateSubject.asObservable();
  private layerPropertyDrawerStateSubject = new BehaviorSubject<{
    visible: boolean;
    data: WebMapServiceFeature[][];
  }>({ visible: false, data: [] });
  layerPropertyDrawerState$ = this.layerPropertyDrawerStateSubject.asObservable();
  layerLegendDrawerStateSubject = new BehaviorSubject<boolean>(false);
  layerLegendDrawerState$ = this.layerLegendDrawerStateSubject.asObservable();

  setSearchDrawerState(state: boolean): void {
    this.searchDrawerStateSubject.next(state);
  }

  setSearchTabularDrawerState(state: boolean): void {
    this.searchTabularDrawerStateSubject.next(state);
  }

  setViewDrawerState(state: boolean): void {
    this.viewDrawerStateSubject.next(state);
  }

  setBaseLayerDrawerState(state: boolean): void {
    this.baseLayerDrawerStateSubject.next(state);
  }

  setChatbotDrawerState(state: boolean): void {
    this.chatbotDrawerStateSubject.next(state);
  }

  setWmsLayerDrawerState(state: boolean): void {
    this.wmsLayerDrawerStateSubject.next(state);
  }

  setLocationDrawerState(state: boolean): void {
    this.locationDrawerStateSubject.next(state);
  }

  setLayerDrawerState(state: boolean): void {
    this.layerDrawerStateSubject.next(state);
  }

  setLayerInfoDrawerState(state: boolean): void {
    this.layerInfoDrawerStateSubject.next(state);
  }

  setLayerPropertyDrawerState(state: { visible: boolean; data: WebMapServiceFeature[][] }): void {
    this.layerPropertyDrawerStateSubject.next(state);
  }

  setLayerLegendDrawerState(state: boolean): void {
    this.layerLegendDrawerStateSubject.next(state);
  }

  // Map states.

  private centerStateSubject = new BehaviorSubject<{
    lat: number;
    lng: number;
  } | null>(null);
  centerState$ = this.centerStateSubject.asObservable();

  setCenterState(center: { lat: number; lng: number }): void {
    this.centerStateSubject.next(center);
  }

  private zoomStateSubject = new BehaviorSubject<number>(12);
  zoomState$ = this.zoomStateSubject.asObservable();

  setZoomState(zoom: number): void {
    this.zoomStateSubject.next(zoom);
  }

  private baseLayerStateSubject = new BehaviorSubject<BaseLayer | null>(null);
  baseLayerState$ = this.baseLayerStateSubject.asObservable();

  setBaseLayerState(baseLayer: BaseLayer): void {
    this.baseLayerStateSubject.next(baseLayer);
  }
}
