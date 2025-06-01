import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { Subscription } from 'rxjs';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { StateService } from './services/state.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    ProgressSpinnerModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, DialogService, ConfirmationService],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly stateService = inject(StateService);
  private subscription: Subscription = new Subscription();

  isLoading = false;

  ngOnInit(): void {
    this.subscription = this.stateService.isLoading$.subscribe(estado => {
      setTimeout(() => {
        this.isLoading = estado;
      });
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
