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

  formGroup = new FormGroup({
    message: new FormControl<string>('', [Validators.required]),
  });

  isRecording = false;

  ngOnInit(): void {
    this.sessionId = uuidv4();
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

        const formData = new FormData();
        formData.append('session_id', this.sessionId ?? '');
        formData.append('message', message ?? '');

        const response = await firstValueFrom(
          this.backendPublicService.getQuery(formData)
        );

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
}
