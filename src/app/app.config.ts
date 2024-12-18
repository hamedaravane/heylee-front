import { ApplicationConfig, importProvidersFrom, isDevMode, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { fa_IR, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import fa from '@angular/common/locales/fa';
import { FormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthenticationInterceptor } from '@auth/interceptors/auth.interceptor';
import { provideServiceWorker } from '@angular/service-worker';
import { NzConfig, provideNzConfig } from 'ng-zorro-antd/core/config';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

registerLocaleData(en);
registerLocaleData(fa);

const ngZorroConfig: NzConfig = {
  message: { nzDirection: 'rtl' },
  modal: { nzDirection: 'rtl' },
  drawer: { nzDirection: 'rtl' },
  notification: { nzDirection: 'rtl' },
  image: { nzCloseOnNavigation: true, nzDirection: 'rtl' },
  table: {
    nzBordered: true,
    nzSize: 'small',
    nzShowQuickJumper: true,
    nzShowSizeChanger: true,
    nzSimple: true,
    nzHideOnSinglePage: true
  }
  // empty: { nzDefaultEmptyContent: '' }
};

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(FormsModule),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideNzI18n(fa_IR),
    provideAnimationsAsync(),
    provideNzConfig(ngZorroConfig),
    provideHttpClient(withInterceptors([AuthenticationInterceptor])),
    provideCharts(withDefaultRegisterables()),
    provideServiceWorker('ngsw-worker.js', { enabled: !isDevMode() })
  ]
};
