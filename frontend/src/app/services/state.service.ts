import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { BaseLayer } from '../models/base-layer.model';
import { MapInformation } from '../models/map.model';
import { WebMapServiceFeature } from '../models/layer.model';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  private mapInformationStateSubject =
    new BehaviorSubject<MapInformation | null>(null);
  mapInformationState$ = this.mapInformationStateSubject.asObservable();

  setMapInformationState(mapInformation: MapInformation): void {
    this.mapInformationStateSubject.next(mapInformation);
  }

  private isLoadingStateSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingStateSubject.asObservable();

  setIsLoadingState(isLoading: boolean) {
    this.isLoadingStateSubject.next(isLoading);
  }

  // Drawer states.

  private searchDrawerStateSubject = new BehaviorSubject<boolean>(false);
  searchDrawerState$ = this.searchDrawerStateSubject.asObservable();
  private searchTabularDrawerStateSubject = new BehaviorSubject<boolean>(false);
  searchTabularDrawerState$ =
    this.searchTabularDrawerStateSubject.asObservable();
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
  layerPropertyDrawerState$ =
    this.layerPropertyDrawerStateSubject.asObservable();

  setSearchDrawerState(state: boolean) {
    this.searchDrawerStateSubject.next(state);
  }

  setSearchTabularDrawerState(state: boolean) {
    this.searchTabularDrawerStateSubject.next(state);
  }

  setViewDrawerState(state: boolean) {
    this.viewDrawerStateSubject.next(state);
  }

  setBaseLayerDrawerState(state: boolean) {
    this.baseLayerDrawerStateSubject.next(state);
  }

  setChatbotDrawerState(state: boolean) {
    this.chatbotDrawerStateSubject.next(state);
  }

  setWmsLayerDrawerState(state: boolean) {
    this.wmsLayerDrawerStateSubject.next(state);
  }

  setLocationDrawerState(state: boolean) {
    this.locationDrawerStateSubject.next(state);
  }

  setLayerDrawerState(state: boolean) {
    this.layerDrawerStateSubject.next(state);
  }

  setLayerInfoDrawerState(state: boolean) {
    this.layerInfoDrawerStateSubject.next(state);
  }

  setLayerPropertyDrawerState(state: {
    visible: boolean;
    data: WebMapServiceFeature[][];
  }) {
    this.layerPropertyDrawerStateSubject.next(state);
  }

  // Map states.

  private centerStateSubject = new BehaviorSubject<{
    lat: number;
    lng: number;
  } | null>(null);
  centerState$ = this.centerStateSubject.asObservable();

  setCenterState(center: { lat: number; lng: number }) {
    this.centerStateSubject.next(center);
  }

  private zoomStateSubject = new BehaviorSubject<number>(12);
  zoomState$ = this.zoomStateSubject.asObservable();

  setZoomState(zoom: number) {
    this.zoomStateSubject.next(zoom);
  }

  private baseLayerStateSubject = new BehaviorSubject<BaseLayer | null>(null);
  baseLayerState$ = this.baseLayerStateSubject.asObservable();

  setBaseLayerState(baseLayer: BaseLayer) {
    this.baseLayerStateSubject.next(baseLayer);
  }
}
