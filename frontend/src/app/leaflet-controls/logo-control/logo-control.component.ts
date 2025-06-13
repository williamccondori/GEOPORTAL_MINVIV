import {NgOptimizedImage} from '@angular/common';
import {Component} from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-logo-control',
  imports: [NgOptimizedImage],
  templateUrl: './logo-control.component.html',
})
export class LogoControlComponent {
  url = 'https://www.gob.pe/vivienda';
  logoUrl = 'img/logo_vivienda.png';
}
