import { Component } from '@angular/core';

import { Message, MessageModule } from 'primeng/message';

@Component({
  standalone: true,
  selector: 'app-index-page',
  imports: [MessageModule],
  templateUrl: './index-page.component.html',
})
export class IndexPageComponent {}
