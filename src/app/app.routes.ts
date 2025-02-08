import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { EvenementComponent } from './organisateur/evenement/evenement.component';
import { CreationCompteComponent } from './organisateur/creation-compte/creation-compte.component';
import { ConnexionComponent } from './organisateur/connexion/connexion.component';
import { NavbarComponent } from './organisateur/nav-bar/nav-bar.component';
import { CreationCompteComponent as CreationCompteParticipantComponent } from './participant/creation-compte/creation-compte.component';
import { ValidationComponent } from './organisateur/validation/validation.component';
import { AcceuilMarketingComponent } from './equipeMarcketing/acceuil-marketing/acceuil-marketing.component';
import { GererEvenementComponent } from './organisateur/gerer-evenement/gerer-evenement.component';

export const routes: Routes = [ 
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'acceuilParticipant', component: EvenementComponent },
  { path: 'inscription', component: CreationCompteComponent },
  { path: 'connexion', component: ConnexionComponent },
  { path: 'acceuilOrganisateur', component: NavbarComponent },
  { path: 'inscription-particapant', component: CreationCompteParticipantComponent },
  { path:'validation',component: ValidationComponent},
  { path: 'acceuilEquipe-marketing', component: AcceuilMarketingComponent },
  { path: 'ajouter-evenement', component: NavbarComponent },
  { path: 'gerer-evenements', component: GererEvenementComponent },

  { path: '**', redirectTo: '', pathMatch: 'full' }
];