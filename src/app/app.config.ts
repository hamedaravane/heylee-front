import {ApplicationConfig, importProvidersFrom, isDevMode, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {en_US, provideNzI18n} from 'ng-zorro-antd/i18n';
import {registerLocaleData} from '@angular/common';
import en from '@angular/common/locales/en';
import {FormsModule} from '@angular/forms';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {loggingInterceptor} from '@auth/interceptors/auth.interceptor';
import {provideServiceWorker} from '@angular/service-worker';
import {NzConfig, provideNzConfig} from 'ng-zorro-antd/core/config';

registerLocaleData(en);

const ngZorroConfig: NzConfig = {
  message: { nzDirection: 'rtl' },
  modal: { nzDirection: 'rtl' },
  drawer: { nzDirection: 'rtl' },
  notification: { nzDirection: 'rtl' }
  // empty: { nzDefaultEmptyContent: '' }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideNzI18n(en_US),
    importProvidersFrom(FormsModule),
    provideAnimationsAsync(),
    provideNzConfig(ngZorroConfig),
    provideHttpClient(withInterceptors([loggingInterceptor])), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          }), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          }),
  ]
};
