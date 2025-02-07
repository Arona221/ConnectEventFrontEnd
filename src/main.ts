import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { JwtHelperService } from '@auth0/angular-jwt';
import { authInterceptorProvider } from './app/core/service/auth.interceptor'; // ✅ Assure-toi que le chemin est correct

// Fonction pour récupérer le jeton du local storage
export function tokenGetter() {
  return localStorage.getItem('authToken');
}

// Configuration de JwtHelperService
const jwtHelper = new JwtHelperService();

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()), // 🔥 Utiliser les intercepteurs déclarés
    provideAnimations(),
    importProvidersFrom(MatSnackBarModule),
    { provide: JwtHelperService, useValue: jwtHelper }, // Fournir JwtHelperService
    authInterceptorProvider, // ✅ Correction ici !
  ],
}).catch((err) => console.error(err));
