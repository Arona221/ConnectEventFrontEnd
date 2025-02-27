(window as any).global = window;
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

/**
 * Démarrage de l'application Angular
 */
bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error('Erreur lors du démarrage de l\'application :', err)
);