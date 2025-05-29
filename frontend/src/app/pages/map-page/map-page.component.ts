import { Component } from '@angular/core';

import { BaseLayerDrawerComponent } from '../../components/base-layer-drawer/base-layer-drawer.component';
import { ChatbotDrawerComponent } from '../../components/chatbot-drawer/chatbot-drawer.component';
import { LayerDrawerComponent } from '../../components/layer-drawer/layer-drawer.component';
import { LayerInfoDrawerComponent } from '../../components/layer-info-drawer/layer-info-drawer.component';
import { LocationDrawerComponent } from '../../components/location-drawer/location-drawer.component';
import { MapComponent } from '../../components/map/map.component';
import { SearchDrawerComponent } from '../../components/search-drawer/search-drawer.component';
import { SearchTabularDrawerComponent } from '../../components/search-tabular-drawer/search-tabular-drawer.component';
import { ViewDrawerComponent } from '../../components/view-drawer/view-drawer.component';
import { WmsLayerDrawerComponent } from '../../components/wms-layer-drawer/wms-layer-drawer.component';

@Component({
  standalone: true,
  selector: 'app-map-page',
  imports: [
    MapComponent,
    ViewDrawerComponent,
    BaseLayerDrawerComponent,
    SearchDrawerComponent,
    ChatbotDrawerComponent,
    SearchTabularDrawerComponent,
    WmsLayerDrawerComponent,
    LocationDrawerComponent,
    LayerDrawerComponent,
    LayerInfoDrawerComponent,
  ],
  templateUrl: './map-page.component.html',
})
export class MapPageComponent {}
