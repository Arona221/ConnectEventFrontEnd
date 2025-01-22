import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { EvenementComponent } from './organisateur/evenement/evenement.component';
import { CreationCompteComponent } from './organisateur/creation-compte/creation-compte.component';
import { CreationCompteComponent as CreationCompteParticipantComponent } from './participant/creation-compte/creation-compte.component';
import { ConnexionComponent } from './organisateur/connexion/connexion.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'evenements', component: EvenementComponent },
  { path: 'creation-compte', component: CreationCompteComponent },
  { path: 'creation-compte-participant', component: CreationCompteParticipantComponent },
  { path: 'connexion', component: ConnexionComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
