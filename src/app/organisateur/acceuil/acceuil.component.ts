import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterModule } from '@angular/router';

@Component({
  selector: 'app-acceuil',
  standalone: true,
  imports: [RouterModule, RouterLink, RouterLinkActive],
  templateUrl: './acceuil.component.html',
  styleUrls: ['./acceuil.component.scss']
})
export class AcceuilComponent {
  nomUtilisateur: string | null = '';
  notificationsCount = 1;

  constructor(private router: Router) {
    this.nomUtilisateur = localStorage.getItem('nomUtilisateur') || 'Utilisateur';
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/connexion']);
  }

}
