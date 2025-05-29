import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { FieldsetModule } from 'primeng/fieldset';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { StateService } from '../../services/state.service';
import { MapInformation } from '../../models/map.model';

@Component({
  selector: 'app-share-form',
  imports: [
    InputGroupModule,
    ButtonModule,
    ReactiveFormsModule,
    InputGroupAddonModule,
    InputTextModule,
    TextareaModule,
    FieldsetModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './share-form.component.html',
})
export class ShareFormComponent implements OnInit {
  private readonly stateService = inject(StateService);
  private readonly messageService = inject(MessageService);

  mapInformation: MapInformation | null = null;

  formGroup: FormGroup = new FormGroup({
    path: new FormControl({
      value: '',
      disabled: true,
    }),
    insert: new FormControl({
      value: '',
      disabled: true,
    }),
  });

  ngOnInit(): void {
    // Subscribe to map information changes
    this.stateService.mapInformationState$.subscribe(mapInfo => {
      this.mapInformation = mapInfo;
      this.updateShareLinks();
    });

    // Initialize with current location
    this.updateShareLinks();
  }

  private updateShareLinks(): void {
    const baseUrl = window.location.origin + window.location.pathname;
    let shareUrl = baseUrl;
    let embedCode = '';

    if (this.mapInformation) {
      const lat = this.mapInformation.latLng[0];
      const lng = this.mapInformation.latLng[1];
      const zoom = this.mapInformation.zoom;

      // Create URL with coordinates and zoom
      shareUrl = `${baseUrl}?lat=${lat.toFixed(6)}&lng=${lng.toFixed(6)}&zoom=${zoom}`;

      // Create embed code
      embedCode = `<iframe src="${shareUrl}" width="100%" height="400" frameborder="0" allowfullscreen></iframe>`;
    } else {
      shareUrl = window.location.href;
      embedCode = `<iframe src="${shareUrl}" width="100%" height="400" frameborder="0" allowfullscreen></iframe>`;
    }

    this.formGroup.patchValue({
      path: shareUrl,
      insert: embedCode,
    });
  }

  private async copyToClipboard(text: string): Promise<void> {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Enlace copiado al portapapeles',
        });
      } catch {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail:
            'No se pudo copiar el enlace. Tu navegador no soporta esta función.',
        });
      }
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail:
          'No se pudo copiar el enlace. Tu navegador no soporta esta función.',
      });
    }
  }

  onCopyLink(): void {
    const link = this.formGroup.get('path')?.value;
    if (link) {
      this.copyToClipboard(link);
    }
  }

  onCopyEmbedCode(): void {
    const embedCode = this.formGroup.get('insert')?.value;
    if (embedCode) {
      this.copyToClipboard(embedCode);
    }
  }

  async onSubmit(): Promise<void> {
    const shareUrl = this.formGroup.get('path')?.value;
    if (shareUrl) {
      await this.copyToClipboard(shareUrl);
    }
  }

  onShareFacebook(): void {
    const shareUrl = this.formGroup.get('path')?.value;
    if (shareUrl) {
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
      window.open(facebookUrl, '_blank', 'width=600,height=400');
    }
  }

  onShareTwitter(): void {
    const shareUrl = this.formGroup.get('path')?.value;
    if (shareUrl) {
      const text = 'Mira este mapa interactivo';
      const twitterUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
      window.open(twitterUrl, '_blank', 'width=600,height=400');
    }
  }
}
