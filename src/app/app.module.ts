import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { CommonModule, TitleCasePipe, CurrencyPipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Angular Material Modules
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

// Import the AppComponent
import { AppComponent } from './app.component';

registerLocaleData(localeFr, 'fr-XOF');

@NgModule({
  declarations: [
    AppComponent,
    // Other components can be declared here
  ],
  imports: [
    BrowserModule,
    CommonModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    MatDialogModule,
    MatTooltipModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
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
  bootstrap: [AppComponent],
})
export class AppModule {}