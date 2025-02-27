import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { CommonModule, TitleCasePipe, CurrencyPipe } from '@angular/common';

// Modules nécessaires
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Modules Angular Material
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';

// Notifications (Toastr)
import { ToastrModule } from 'ngx-toastr';

// Services
import { EvenementService } from './core/service/evenement.service';

// Importation correcte des routes
import { routes } from './app.routes';

registerLocaleData(localeFr, 'fr-XOF');

@NgModule({
  declarations: [
    // Vos composants ici
  ],
  imports: [
    BrowserModule,
    CommonModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,

    // Correction : Ajout des routes correctement configurées
    RouterModule.forRoot(routes),

    // Modules Angular Material
    MatDialogModule,
    MatTooltipModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,

    // Configuration de Toastr
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'fr-XOF' },
    EvenementService,
    TitleCasePipe,
    CurrencyPipe,
  ],
  bootstrap: [AppComponent], // Assurez-vous que AppComponent est déclaré ici
})
export class AppModule {}