import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CreationCompteComponent } from './organisateur/creation-compte/creation-compte.component';
import { ConnexionComponent } from './organisateur/connexion/connexion.component';
import { NavBarComponent } from './organisateur/nav-bar/nav-bar.component';
import { CreationCompteComponent as CreationCompteParticipantComponent } from './participant/creation-compte/creation-compte.component';
import { ValidationComponent } from './organisateur/validation/validation.component';
import { AcceuilMarketingComponent } from './equipeMarcketing/acceuil-marketing/acceuil-marketing.component';
import { GererEvenementComponent } from './organisateur/gerer-evenement/gerer-evenement.component';
import { AcceuilComponent } from './organisateur/acceuil/acceuil.component';
import { MenuComponent } from './menu/menu.component';
import { TrouverevenetComponent } from './home/trouverevenet/trouverevenet.component';
import { CreerevenementComponent as CreerEvenementComponent } from './home/creerevenement/creerevenement.component';
import { EveenementComponent } from './participant/eveenement/eveenement.component';
import { MesTicketsComponent } from './participant/mes-tickets/mes-tickets.component';
import { ConsulterComponent } from './organisateur/consulter/consulter.component';
import { EditerEvenementComponent } from './organisateur/editer-evenement/editer-evenement.component';
import { AcheterComponent } from './participant/acheter/acheter.component';
import { MesFavorisComponent } from './participant/mes-favoris/mes-favoris.component';
import { TrouverRessourcesComponent } from './organisateur/trouver-ressources/trouver-ressources.component';
import { MesReservationsComponent } from './organisateur/mes-reservations/mes-reservations.component';
import { NotificationComponent } from './organisateur/notification/notification.component';




export const routes: Routes = [ 
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'inscription', component: CreationCompteComponent },
  { path: 'connexion', component: ConnexionComponent },
  { path: 'acceuilOrganisateur', component: NavBarComponent },
  { path: 'inscription-particapant', component: CreationCompteParticipantComponent },
  { path:'validation',component: ValidationComponent},
  { path: 'acceuilEquipe-marketing', component: AcceuilMarketingComponent },
  { path: 'ajouter-evenement', component: NavBarComponent },
  { path: 'gerer-evenements', component: GererEvenementComponent },
  { path: 'acceuil-organisateur', component: AcceuilComponent },
  { path: 'trouver-evenement', component: TrouverevenetComponent },
  { path: 'creer-evenement', component: CreerEvenementComponent },
  { path: 'participant', component: EveenementComponent },
  { path: 'mes-tickets', component: MesTicketsComponent },
  { path: 'consulter/:id', component: ConsulterComponent },
  { path: 'editer-evenement/:id', component: EditerEvenementComponent },
  { path: 'achat/:id', component: AcheterComponent },
  { path:'mes-favoris',component:MesFavorisComponent},
  { path:'trouver-ressources',component:TrouverRessourcesComponent},
  { path:'mes-ressources',component:MesReservationsComponent},
  { path:'notifications',component:NotificationComponent},
  { path: '**', redirectTo: '', pathMatch: 'full' },  


]