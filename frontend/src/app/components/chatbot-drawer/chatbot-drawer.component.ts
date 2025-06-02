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
import { ChatResponse, ChatMessage } from '../../models/chatbot.model';
import { Constants } from '../../models/constants';
import { BackendPublicService } from '../../services/backend-public.service';
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
      this.mediaRecorder.addEventListener('dataavailable', event => {
        chunks.push(event.data);
      });

      this.mediaRecorder.addEventListener('stop', async () => {
        this.isRecording = false;
        clearTimeout(timerId);
        const audioBlob = new Blob(chunks, {
          type: 'audio/webm',
        });

        chunks = [];
        stream.getTracks().forEach(track => track.stop());
        this.mediaRecorder = null;

        try {
          this.stateService.setIsLoadingState(true);

          const formData = new FormData();
          formData.append('session_id', this.sessionId ?? '');
          formData.append('audio', audioBlob, 'audio.webm');

          const response = await firstValueFrom(
            this.backendPublicService.getVoiceQuery(formData)
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

        const response = await firstValueFrom(
          this.backendPublicService.getQuery(formData)
        );

        // Only add bot response to conversation
        if (response && response.length > 0) {
          const chatResponse = response[0];
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

  private addToChat(response: ChatResponse[]): void {
    if (response && response.length > 0) {
      const chatResponse = response[0];

      // Add user message to conversation
      if (chatResponse.initialMessage) {
        const userMessage: ChatMessage = {
          id: uuidv4(),
          content: chatResponse.initialMessage,
          isUser: true,
          timestamp: new Date(),
        };
        this.conversation.push(userMessage);
      }

      // Add bot message with typing effect
      if (chatResponse.message) {
        const botMessage: ChatMessage = {
          id: uuidv4(),
          content: '',
          isUser: false,
          timestamp: new Date(),
          isTyping: true,
        };
        this.conversation.push(botMessage);

        // Simulate typing effect
        this.typeMessage(botMessage, chatResponse.message);
      }
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
}
