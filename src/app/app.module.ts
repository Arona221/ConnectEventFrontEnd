import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr-BE';
import { AppComponent } from './app.component';
import { EvenementService } from './core/service/evenement.service';
import { TitleCasePipe, CurrencyPipe, CommonModule } from '@angular/common';

// Modules Angular Material
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Importer ngx-toastr
import { ToastrModule } from 'ngx-toastr';

// Configuration locale pour le XOF
registerLocaleData(localeFr, 'fr-XOF');

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    CommonModule,
    BrowserAnimationsModule, // Nécessaire pour les animations
    MatDialogModule,
    MatTooltipModule,
    MatButtonModule,
    MatIconModule,
    
    // Ajouter ToastrModule pour afficher les notifications
    ToastrModule.forRoot({   // Configuration par défaut
      timeOut: 3000,         // Durée d'affichage du toast (3 secondes)
      positionClass: 'toast-top-right', // Position du toast
      preventDuplicates: true, // Empêche les toasts en double
    }),
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'fr-XOF' },
    EvenementService,
    TitleCasePipe,
    CurrencyPipe
  ]
})
export class AppModule {
  
}
