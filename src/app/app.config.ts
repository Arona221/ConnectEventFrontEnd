import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';
import { authInterceptorProvider } from './core/service/auth.interceptor';
import { provideToastr } from 'ngx-toastr';
import { MatSnackBarModule } from '@angular/material/snack-bar';

/**
 * Fonction pour récupérer le jeton JWT du localStorage
 * @returns Le jeton JWT ou null
 */
export function tokenGetter() {
  return localStorage.getItem('authToken');
}

export const appConfig: ApplicationConfig = {
  providers: [
    // Configuration du routeur
    provideRouter(routes),

    // Configuration du client HTTP avec les intercepteurs
    provideHttpClient(withInterceptorsFromDi()),

    // Activation des animations
    provideAnimations(),

    // Configuration de Toastr pour les notifications
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),

    // Importation des modules Angular Material
    importProvidersFrom(MatSnackBarModule),

    // Configuration de l'intercepteur JWT
    authInterceptorProvider,

    // Configuration de JwtHelperService
    { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
    JwtHelperService,
  ],
};