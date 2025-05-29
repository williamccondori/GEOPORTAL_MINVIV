import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { FieldsetModule } from 'primeng/fieldset';
import { IconFieldModule } from 'primeng/iconfield';
import { ImageModule } from 'primeng/image';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';

import { WebMapServiceLayer } from '../../models/wms-info.model';
import { WmsLayerExtensionMapComponent } from '../wms-layer-extension-map/wms-layer-extension-map.component';
import { LayerService } from '../../services/layer.service';
import { UserWmsLayer } from '../../models/layer.model';

@Component({
  standalone: true,
  selector: 'app-wms-layer-list',
  imports: [
    TableModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ButtonModule,
    RippleModule,
    FieldsetModule,
    ImageModule,
    SelectModule,
    WmsLayerExtensionMapComponent,
    FormsModule,
  ],
  templateUrl: './wms-layer-list.component.html',
})
export class WmsLayerListComponent implements OnInit {
  private readonly layerService = inject(LayerService);
  private readonly dynamicDialogConfig = inject(DynamicDialogConfig);
  private wmsUrl: string | null = null;

  expandedRows = {};
  layers: WebMapServiceLayer[] = [];

  ngOnInit(): void {
    this.loadComponent();
  }

  onSearch(event: Event, table: Table): void {
    const input = event.target as HTMLInputElement;
    table.filterGlobal(input.value, 'contains');
  }

  onExport(selectedExportUrl: string): void {
    const link = document.createElement('a');
    link.href = selectedExportUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  onAdd(layerName: string): void {
    const layer: WebMapServiceLayer | null = this.layers.find(
      layer => layer.name === layerName
    )!;
    if (layer) {
      this.layerService.onAddUserWmsLayer({
        id: layer.name,
        name: layer.name,
        title: layer.title,
        url: this.wmsUrl,
      } as UserWmsLayer);
    }
  }

  private async loadComponent(): Promise<void> {
    const data = this.dynamicDialogConfig.data as Partial<{
      layers: WebMapServiceLayer[];
      url: string;
    }>;
    if (data.layers) {
      this.wmsUrl = data.url ?? null;
      this.layers = data.layers;
    }
  }
}
