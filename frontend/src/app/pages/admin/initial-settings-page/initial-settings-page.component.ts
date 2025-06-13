import {Component} from '@angular/core';

import {
  InitialSettingsFormComponent
} from '../../../components/admin/initial-settings-form/initial-settings-form.component';

@Component({
  standalone: true,
  selector: 'app-initial-settings-page',
  imports: [InitialSettingsFormComponent],
  templateUrl: './initial-settings-page.component.html',
})
export class InitialSettingsPageComponent {
}
