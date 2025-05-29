import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';

import { DrawerModule } from 'primeng/drawer';

import { StateService } from '../../services/state.service';

@Component({
  standalone: true,
  selector: 'app-chatbot-drawer',
  imports: [DrawerModule, AsyncPipe],
  templateUrl: './chatbot-drawer.component.html',
  styleUrls: ['./chatbot-drawer.component.css'],
})
export class ChatbotDrawerComponent {
  private readonly stateService = inject(StateService);

  get isVisible() {
    return this.stateService.chatbotDrawerState$;
  }

  onHide() {
    this.stateService.setChatbotDrawerState(false);
  }
}
