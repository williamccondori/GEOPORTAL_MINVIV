import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';

import { StateService } from './services/state.service';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [
    RouterOutlet,
    ProgressSpinnerModule,
    AsyncPipe,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService, DialogService],
  templateUrl: './app.component.html',
})
export class AppComponent {
  private readonly stateService = inject(StateService);

  get isLoading$() {
    return this.stateService.isLoading$;
  }
}
