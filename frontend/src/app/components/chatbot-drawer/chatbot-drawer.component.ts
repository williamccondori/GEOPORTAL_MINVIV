/* eslint-disable complexity */
import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';

import { DrawerModule } from 'primeng/drawer';

import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { firstValueFrom, Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage, ChatResponse } from '../../models/chatbot.model';
import { Constants } from '../../models/constants';
import { BackendPublicService } from '../../services/backend-public.service';
import { LayerService } from '../../services/layer.service';
import { StateService } from '../../services/state.service';

@Component({
  standalone: true,
  selector: 'app-chatbot-drawer',
  imports: [
    DrawerModule,
    AsyncPipe,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
  ],
  templateUrl: './chatbot-drawer.component.html',
  styleUrls: ['./chatbot-drawer.component.css'],
})
export class ChatbotDrawerComponent implements OnInit {
  private readonly stateService = inject(StateService);
  private readonly messageService = inject(MessageService);
  private readonly backendPublicService = inject(BackendPublicService);
  private readonly layerService = inject(LayerService);

  sessionId: string | null = null;
  mediaRecorder: MediaRecorder | null = null;
  conversation: ChatMessage[] = [];

  formGroup = new FormGroup({
    message: new FormControl<string>('', [Validators.required]),
  });

  isRecording = false;

  ngOnInit(): void {
    this.sessionId = uuidv4();
    // Initialize with a welcome message
    this.conversation = [
      {
        id: uuidv4(),
        content: 'Hola, ¿en qué puedo ayudarte?',
        isUser: false,
        timestamp: new Date(),
      },
    ];
  }

  get isVisible(): Observable<boolean> {
    return this.stateService.chatbotDrawerState$;
  }

  onHide(): void {
    this.stateService.setChatbotDrawerState(false);
  }

  async onRecordAudio(): Promise<void> {
    const MAX_RECORDING_TIME = 6000;

    try {
      let chunks: Blob[] = [];

      if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.stop();
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.start();
      this.isRecording = true;

      // Se establece un temporizador para detener la grabación después de un tiempo máximo.
      const timerId = setTimeout(() => {
        this.mediaRecorder?.stop();
      }, MAX_RECORDING_TIME);

      // Se va a guardar los datos de audio en un array de blobs.
      this.mediaRecorder.addEventListener('dataavailable', (event) => {
        chunks.push(event.data);
      });

      this.mediaRecorder.addEventListener('stop', async () => {
        this.isRecording = false;
        clearTimeout(timerId);
        const audioBlob = new Blob(chunks, {
          type: 'audio/webm',
        });

        chunks = [];
        stream.getTracks().forEach((track) => track.stop());
        this.mediaRecorder = null;

        try {
          this.stateService.setIsLoadingState(true);

          const formData = new FormData();
          formData.append('session_id', this.sessionId ?? '');
          formData.append('audio', audioBlob, 'audio.webm');

          const response = await firstValueFrom(this.backendPublicService.getVoiceQuery(formData));

          // Handle voice response similar to text response
          if (response && response.length > 0) {
            const chatResponse = response[0];

            // Add user voice message to conversation
            if (chatResponse.initialMessage) {
              const userMessage: ChatMessage = {
                id: uuidv4(),
                content: chatResponse.initialMessage,
                isUser: true,
                timestamp: new Date(),
              };
              this.conversation.push(userMessage);
            }

            // Add bot response with typing effect
            if (chatResponse.message) {
              const botMessage: ChatMessage = {
                id: uuidv4(),
                content: '',
                isUser: false,
                timestamp: new Date(),
                isTyping: true,
              };
              this.conversation.push(botMessage);
              this.typeMessage(botMessage, chatResponse.message);
            }
          }
        } catch (e) {
          console.error(e);
          this.messageService.add({
            severity: 'error',
            summary: 'ERROR',
            detail: Constants.ERROR_MESSAGE,
          });
        } finally {
          this.stateService.setIsLoadingState(false);
        }
      });
    } catch (e) {
      console.error(e);
      this.messageService.add({
        severity: 'error',
        summary: 'ERROR',
        detail: Constants.ERROR_MESSAGE,
      });
    }
  }

  async onSendMessage(): Promise<void> {
    if (this.formGroup.valid) {
      try {
        this.stateService.setIsLoadingState(true);

        const formValues = this.formGroup.getRawValue();
        const { message } = formValues;

        // Add user message to conversation immediately
        if (message) {
          const userMessage: ChatMessage = {
            id: uuidv4(),
            content: message,
            isUser: true,
            timestamp: new Date(),
          };
          this.conversation.push(userMessage);
        }

        const formData = new FormData();
        formData.append('session_id', this.sessionId ?? '');
        formData.append('message', message ?? '');

        const response = await firstValueFrom(this.backendPublicService.getQuery(formData));

        // Only add bot response to conversation
        if (response && response.length > 0) {
          const chatResponse = response[0];
          if (chatResponse.message) {
            await this.manageIntent(chatResponse);
            const botMessage: ChatMessage = {
              id: uuidv4(),
              content: '',
              isUser: false,
              timestamp: new Date(),
              isTyping: true,
            };
            this.conversation.push(botMessage);
            this.typeMessage(botMessage, chatResponse.message);
          }
        }

        this.formGroup.reset();
      } catch (e) {
        console.error(e);
        this.messageService.add({
          severity: 'error',
          summary: 'ERROR',
          detail: Constants.ERROR_MESSAGE,
        });
      } finally {
        this.stateService.setIsLoadingState(false);
      }
    } else {
      this.formGroup.markAllAsTouched();
      this.formGroup.updateValueAndValidity();
    }
  }

  private typeMessage(message: ChatMessage, fullText: string): void {
    let currentIndex = 0;
    const typingSpeed = 50; // milliseconds per character

    const typeInterval = setInterval(() => {
      if (currentIndex < fullText.length) {
        message.content += fullText.charAt(currentIndex);
        currentIndex++;
      } else {
        message.isTyping = false;
        clearInterval(typeInterval);
      }
    }, typingSpeed);
  }

  private async manageIntent(chatResponse: ChatResponse): Promise<void> {
    if (chatResponse.action === 'activar_capa') {
      const layerId: string = chatResponse.data?.layerId as string;
      const layer = await firstValueFrom(this.backendPublicService.getLayerById(layerId));
      if (layer) {
        const activeLayer = {
          id: layer.id,
          name: layer.name,
          title: layer.title || layer.name,
          url: layer.url,
          opacity: 1,
          zIndex: 1,
        };
        this.layerService.onAddActiveLayer(activeLayer);
      }
    } else if (chatResponse.action === 'desactivar_capa') {
      const layerId: string = chatResponse.data?.layerId as string;
      if (layerId) {
        this.layerService.onDeleteActiveLayer(layerId);
      }
    } else if (chatResponse.action === 'filtrar_suelo_urbano') {
      const filterColumns = chatResponse.data;

      const result = await firstValueFrom(
        this.backendPublicService.getFilteredLayer('683c83d10cd4a888fb9a10c9', filterColumns),
      );

      console.error('Filtered:', result.geojson);

      // Check if there's an existing filtered layer and remove it
      const existingFilteredLayers = this.layerService
        .activeGeoJsonLayers()
        .filter((layer) => layer.id.startsWith('filtered_suelo_urbano'));
      existingFilteredLayers.forEach((layer) => {
        this.layerService.onDeleteActiveGeoJsonLayer(layer.id);
      });

      // Add the new filtered GeoJSON layer to the map
      if (result.geojson) {
        const filteredLayer = {
          id: `filtered_suelo_urbano_${Date.now()}`,
          name: 'Suelo Urbano Filtrado',
          title: 'Suelo Urbano Filtrado',
          geojson: result.geojson,
          opacity: 0.8,
          zIndex: 1000,
          style: {
            color: '#ff6b35',
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0.4,
            fillColor: '#ff6b35',
          },
        };
        this.layerService.onAddActiveGeoJsonLayer(filteredLayer);
      }
    }
  }
}
