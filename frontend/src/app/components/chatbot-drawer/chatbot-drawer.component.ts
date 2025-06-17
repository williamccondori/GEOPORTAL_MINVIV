/* eslint-disable complexity */
import { AsyncPipe, DatePipe } from '@angular/common';
import {
  AfterViewChecked,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';

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
import { InputSwitchModule } from 'primeng/inputswitch';
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
    DatePipe,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputSwitchModule,
  ],
  templateUrl: './chatbot-drawer.component.html',
  styleUrls: ['./chatbot-drawer.component.css'],
})
export class ChatbotDrawerComponent
  implements OnInit, OnDestroy, AfterViewChecked
{
  private readonly stateService = inject(StateService);
  private readonly messageService = inject(MessageService);
  private readonly backendPublicService = inject(BackendPublicService);
  private readonly layerService = inject(LayerService);
  sessionId: string | null = null;
  mediaRecorder: MediaRecorder | null = null;
  conversation: ChatMessage[] = [];
  isSpeechEnabled = true; // Activado por defecto
  isSpeaking = false;
  speechSynthesis = window.speechSynthesis;
  private shouldScrollToBottom = false;

  formGroup = new FormGroup({
    message: new FormControl<string>('', [Validators.required]),
  });

  isRecording = false;

  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  @ViewChild('chatMessages') private chatMessagesContainer!: ElementRef;

  ngOnInit(): void {
    this.sessionId = uuidv4();
    // Initialize with a welcome message
    this.conversation = [];

    // Initialize speech synthesis
    this.initializeSpeechSynthesis();
  }
  ngOnDestroy(): void {
    // Cancel any ongoing speech synthesis when component is destroyed
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }
  private scrollToBottom(): void {
    try {
      if (this.chatMessagesContainer) {
        const element = this.chatMessagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    } catch (err) {
      // Error handling without console log
    }
  }

  private triggerScrollToBottom(): void {
    this.shouldScrollToBottom = true;
  }  private initializeSpeechSynthesis(): void {
    if (this.speechSynthesis) {
      // Load voices if not already loaded
      if (this.speechSynthesis.getVoices().length === 0) {
        this.speechSynthesis.addEventListener('voiceschanged', () => {
          // Voices loaded without logging
        });
      }
    }
  }

  get isVisible(): Observable<boolean> {
    return this.stateService.chatbotDrawerState$;
  }

  onHide(): void {
    this.stateService.setChatbotDrawerState(false);
  }

  // Método de prueba para verificar que la síntesis de voz funciona
  testSpeech(): void {
    if (!this.speechSynthesis) {
      this.messageService.add({
        severity: 'error',
        summary: 'ERROR',
        detail: 'La síntesis de voz no está disponible en tu navegador',
      });
      return;
    }    // Test con la mejor voz femenina disponible
    const testText =
      'Hola, soy tu asistente virtual del Ministerio de Vivienda. Esta es una prueba de mi voz.';

    this.speechSynthesis.cancel();

    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(testText);

      // Usar la misma lógica de selección de voz que el chat
      const selectedVoice = this.getBestFemaleVoice();
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      } else {
        utterance.lang = 'es-ES';
      }

      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;

      utterance.onstart = () => {
        this.isSpeaking = true;
      };

      utterance.onend = () => {
        this.isSpeaking = false;
      };

      utterance.onerror = (event) => {
        this.isSpeaking = false;
        this.messageService.add({
          severity: 'error',
          summary: 'ERROR',
          detail: `Error de síntesis de voz: ${event.error}`,
        });
      };

      try {
        this.speechSynthesis.speak(utterance);
        this.messageService.add({
          severity: 'info',
          summary: 'INFO',
          detail: 'Probando síntesis de voz (forzado)...',
        });
      } catch (error) {
        this.messageService.add({
          severity: 'error',
          summary: 'ERROR',
          detail: 'Error al reproducir la voz',
        });
      }
    }, 100);
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

          const response = await firstValueFrom(
            this.backendPublicService.getVoiceQuery(formData),
          );

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
              this.triggerScrollToBottom();
            } // Add bot response with typing effect
            if (chatResponse.message) {
              const botMessage: ChatMessage = {
                id: uuidv4(),
                content: '',
                isUser: false,
                timestamp: new Date(),
                isTyping: true,
              };
              this.conversation.push(botMessage);
              this.triggerScrollToBottom();
              this.typeMessage(botMessage, chatResponse.message);
            }
          }        } catch (e) {
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
        const { message } = formValues; // Add user message to conversation immediately
        if (message) {
          const userMessage: ChatMessage = {
            id: uuidv4(),
            content: message,
            isUser: true,
            timestamp: new Date(),
          };
          this.conversation.push(userMessage);
          this.triggerScrollToBottom();
        }

        const formData = new FormData();
        formData.append('session_id', this.sessionId ?? '');
        formData.append('message', message ?? '');

        const response = await firstValueFrom(
          this.backendPublicService.getQuery(formData),
        ); // Only add bot response to conversation
        if (response && response.length > 0) {
          const chatResponse = response[0];          if (chatResponse.message) {
            await this.manageIntent(chatResponse);
            const botMessage: ChatMessage = {
              id: uuidv4(),
              content: '',
              isUser: false,
              timestamp: new Date(),
              isTyping: true,
            };
            this.conversation.push(botMessage);
            this.triggerScrollToBottom();

            this.typeMessage(botMessage, chatResponse.message);
          }
        }        this.formGroup.reset();
      } catch (e) {
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
  // Limpiar todo el chat
  onClearChat(): void {
    this.conversation = [];
    this.sessionId = uuidv4(); // Generar nueva sesión
  }
  // Remover emojis para mejor síntesis de voz
  private removeEmojis(text: string): string {
    return text
      .replace(
        /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu,
        '',
      )
      .replace(
        /🤝|�|�|�|�|�🚀|�|🔍|📈|📉|📋|💡|⚠️|✅|❌|�|�|🌟|💰|📱|🔧|🛠️|🎨|📝|🎁|🎉|🔔|📢|🎪|🎭|🎶|🎸|🎤|🎧|🎬|🎮|🃏|🎲|🎯|🎳|🎯|🎺|🎻|🎹|🥁|🎸|🎵|🎼|🎭|🎪|🎨|🖼️|🎬|📷|📹|📺|📻|📱|💻|🖥️|⌨️|🖱️|🖨️|💾|💿|📀|🎥|📽️|📞|☎️|📠|📧|📨|📩|📤|📥|📦|📫|📪|📬|📭|📮|🗳️|✏️|✒️|🗑️|🔒|🔓|🔏|🔐|🔑|🗝️|🔨|⛏️|⚒️|🛠️|🗡️|⚔️|🔫|🏹|🛡️|🔧|🔩|⚙️|🗜️|⚖️|🔗|⛓️|🧰|🧲|⚗️|🧪|🧫|🧬|🔬|🔭|📡|💉|💊|🩹|🩺|🚪|🛏️|🛋️|🚽|🚿|🛁|🧴|🧷|🧹|🧺|🧻|🧼|🧽|�|🛒|🚬|⚰️|⚱️|�|�|🪓|🪔|🪕|🪗|🪘|🪙|🪚|🪛|🪜|🪝|🪞|🪟|🪠|🪡|🪢|🪣|🪤|🪥|🪦|🪧|🪨|🪩|🪪|🪫|🪬|🪭|🪮|🪯|🪰|🪱|🪲|🪳|🪴|🪵|🪶|🪷|🪸|🪹|🪺|🫀|🫁|🫂|🫃|🫄|🫅|🫐|🫑|🫒|🫓|🫔|🫕|🫖|🫗|🫘|🫙|🫚|🫛|🫜|🫝|🫞|🫟|🫠|🫡|🫢|🫣|🫤|🫥|🫦|🫧|🫨|🫩|🫪|🫫|🫬|🫭|🫮|🫯|🫰|🫱|🫲|🫳|🫴|🫵|🫶|🫷|🫸/g,
        '',
      )
      .trim();
  }

  private typeMessage(message: ChatMessage, fullText: string): void {
    let currentIndex = 0;
    const typingSpeed = 30; // Más rápido para mejor experiencia

    const typeInterval = setInterval(() => {
      if (currentIndex < fullText.length) {
        message.content += fullText.charAt(currentIndex);
        currentIndex++;
        // Scroll suave mientras se escribe
        if (currentIndex % 10 === 0) {
          // Cada 10 caracteres
          this.triggerScrollToBottom();
        }
      } else {        message.isTyping = false;
        clearInterval(typeInterval);
        this.triggerScrollToBottom(); // Scroll final

        if (this.isSpeechEnabled) {
          setTimeout(() => {
            this.speakMessage(fullText);
          }, 100); // Pequeña pausa antes de hablar
        }
      }
    }, typingSpeed);  }
    private getBestFemaleVoice(): SpeechSynthesisVoice | null {
    if (!this.speechSynthesis) return null;

    const voices = this.speechSynthesis.getVoices();

    // Nombres femeninos comunes en español
    const femaleNames = [
      'Sabina',
      'maria',
      'lucia',
      'carmen',
      'esperanza',
      'pilar',
      'monica',
      'alejandra',
      'carolina',
      'valentina',
      'sofia',
      'paula',
      'elena',
      'cristina',
      'isabela',
      'fernanda',
    ];

    // Palabras clave que indican voz femenina
    const femaleKeywords = [
      'Sabina',
      'female',
      'mujer',
      'femenina',
      'woman',
      'hembra',
      'ella',
      'señora',
      'lady',
      'girl',
      'chica',
    ];

    // 1. Buscar voces españolas con nombres femeninos explícitos
    let bestVoice = voices.find((voice) => {
      const nameLower = voice.name.toLowerCase();
      const isSpanish =
        voice.lang.startsWith('es') ||
        nameLower.includes('spanish') ||
        nameLower.includes('español');
      const hasFemaleNames = femaleNames.some((name) =>
        nameLower.includes(name),
      );      const hasFemaleKeywords = femaleKeywords.some((keyword) =>
        nameLower.includes(keyword),
      );

      if (isSpanish && (hasFemaleNames || hasFemaleKeywords)) {
        return true;
      }
      return false;
    });

    // 2. Si no encontramos, buscar voces que NO sean explícitamente masculinas en español
    if (!bestVoice) {
      bestVoice = voices.find((voice) => {
        const nameLower = voice.name.toLowerCase();
        const isSpanish =
          voice.lang.startsWith('es') ||
          nameLower.includes('spanish') ||
          nameLower.includes('español');
        const isMale =
          nameLower.includes('male') ||
          nameLower.includes('hombre') ||
          nameLower.includes('masculino') ||
          nameLower.includes('man') ||
          nameLower.includes('carlos') ||
          nameLower.includes('juan') ||
          nameLower.includes('miguel') ||
          nameLower.includes('antonio');        if (isSpanish && !isMale) {
          return true;
        }
        return false;
      });
    }

    // 3. Como último recurso, cualquier voz en español
    if (!bestVoice) {      bestVoice = voices.find(
        (voice) =>
          voice.lang.startsWith('es') ||
          voice.name.toLowerCase().includes('spanish'),
      );
    }

    // 4. Si no hay voces en español, buscar cualquier voz femenina
    if (!bestVoice) {
      bestVoice = voices.find((voice) => {
        const nameLower = voice.name.toLowerCase();
        const hasFemaleNames = femaleNames.some((name) =>
          nameLower.includes(name),
        );
        const hasFemaleKeywords = femaleKeywords.some((keyword) =>
          nameLower.includes(keyword),
        );
        const isMale = nameLower.includes('male') || nameLower.includes('man');        return (hasFemaleNames || hasFemaleKeywords) && !isMale;
      });
    }

    return bestVoice || null;
  }

  private speakMessage(text: string): void {
    if (!this.speechSynthesis || !this.isSpeechEnabled || !text) {
      return;
    }

    this.speechSynthesis.cancel();

    setTimeout(() => {
      try {
        // Remove emojis for better speech synthesis
        const cleanText = this.removeEmojis(text);
        const utterance = new SpeechSynthesisUtterance(cleanText);        // Get the best female voice available
        const selectedVoice = this.getBestFemaleVoice();
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        } else {
          utterance.lang = 'es-ES';
        }

        utterance.rate = 0.8;
        utterance.pitch = 1.0;
        utterance.volume = 0.9;

        utterance.onstart = () => {
          this.isSpeaking = true;
        };

        utterance.onend = () => {
          this.isSpeaking = false;
        };

        utterance.onerror = () => {
          this.isSpeaking = false;
        };

        this.speechSynthesis.speak(utterance);
      } catch (error) {
        this.isSpeaking = false;
      }
    }, 150);
  }

  stopSpeaking(): void {
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }
  onToggleSpeech(): void {
    setTimeout(() => {
      if (!this.isSpeechEnabled && this.speechSynthesis) {
        this.speechSynthesis.cancel();
        this.isSpeaking = false;
      } else if (this.isSpeechEnabled) {
        // When enabling speech, speak the last bot message if available
        const lastBotMessage = this.conversation
          .filter((msg) => !msg.isUser && !msg.isTyping)
          .pop();

        if (lastBotMessage && lastBotMessage.content) {
          setTimeout(() => {
            this.speakMessage(lastBotMessage.content);
          }, 300);
        }
      }
    }, 10);
  }
  private async manageIntent(chatResponse: ChatResponse): Promise<void> {
    if (chatResponse.action === 'activar_capa') {
      const layerId: string = chatResponse.data?.layerId as string;
      const layer = await firstValueFrom(
        this.backendPublicService.getLayerById(layerId),
      );
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
        this.backendPublicService.getFilteredLayer(
          '684e4c876f591c3bcb14c01a',
          filterColumns,
        ),
      );

      // Check if there's an existing filtered layer and remove it
      const existingFilteredLayers = this.layerService
        .activeGeoJsonLayers()
        .filter((layer) => layer.id.startsWith('filtered_suelo_urbano'));
      existingFilteredLayers.forEach((layer) => {
        this.layerService.onDeleteActiveGeoJsonLayer(layer.id);
      });

      // Add the new filtered GeoJSON layer to the map
      if (result) {
        const filteredLayer = {
          id: `filtered_suelo_urbano_${Date.now()}`,
          layerId: '684e4c876f591c3bcb14c01a',
          name: 'Suelo Urbano Filtrado',
          title: 'Suelo Urbano Filtrado',
          geojson: result,
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
