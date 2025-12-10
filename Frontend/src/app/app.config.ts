import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { routes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { JWT_OPTIONS, JwtHelperService } from '@auth0/angular-jwt';
import { CookieService } from 'ngx-cookie-service';
import { TokenInterceptor } from './interceptors/token.interceptor';
import { LoaderInterceptor } from './interceptors/loader.interceptor';
import {
  SocialAuthServiceConfig,
  FacebookLoginProvider,
  SocialLoginModule,
} from 'angularx-social-login';
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptorsFromDi()),
    JwtHelperService,
    CookieService,
    {
      provide: JWT_OPTIONS,
      useFactory: (cookieService: CookieService) => ({
        tokenGetter: () => {
          return cookieService.get('accessToken'); // Lấy token từ cookie
        },
        allowedDomains: ['localhost:7163'], // Ví dụ domain hợp lệ cho API
        disallowedRoutes: ['localhost:7163/api/AccountAPI/Login'], // Các route không cần token
      }),
      deps: [CookieService], // Đảm bảo CookieService được tiêm vào
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },
    importProvidersFrom(SocialLoginModule, FormsModule),
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: FacebookLoginProvider.PROVIDER_ID,
            provider: new FacebookLoginProvider('1353851149399285'),
          },
        ],
      } as SocialAuthServiceConfig,
    },
  ],
};
