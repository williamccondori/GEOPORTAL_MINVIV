import {registerLocaleData} from '@angular/common';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import localeEsPe from '@angular/common/locales/es-PE';
import {ApplicationConfig, LOCALE_ID, provideZoneChangeDetection} from '@angular/core';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {provideRouter} from '@angular/router';

import {definePreset} from '@primeng/themes';
import Aura from '@primeng/themes/aura';
import {providePrimeNG} from 'primeng/config';

import {routes} from './app.routes';
import {authInterceptor} from './auth.interceptor';

registerLocaleData(localeEsPe, 'es-PE');

const Theme = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#e7f0fe',
      100: '#c2d9fd',
      200: '#9cc1fb',
      300: '#75a8fa',
      400: '#4f90f8',
      500: '#0d6efd',
      600: '#0b5edc',
      700: '#094db9',
      800: '#073c96',
      900: '#052b73',
      950: '#031b4f',
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    providePrimeNG({
      ripple: true,
      theme: {
        preset: Theme,
        options: {
          darkModeSelector: false,
        },
      },
    }),
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    {
      provide: LOCALE_ID,
      useValue: 'es-PE',
    },
  ],
};
