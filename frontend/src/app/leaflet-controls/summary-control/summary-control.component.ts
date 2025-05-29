import { Component } from '@angular/core';

import { AccordionModule } from 'primeng/accordion';
import { CardModule } from 'primeng/card';
import { ScrollPanelModule } from 'primeng/scrollpanel';

@Component({
  standalone: true,
  selector: 'app-summary-control',
  imports: [AccordionModule, CardModule, ScrollPanelModule],
  templateUrl: './summary-control.component.html',
})
export class SummaryControlComponent {}
