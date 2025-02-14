import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-eveenement',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './eveenement.component.html',
  styleUrls: ['./eveenement.component.scss']
})
export class EveenementComponent {
  notificationsCount = 1;
  nomUtilisateur: string | null = '';

  constructor(private router: Router) {
    this.nomUtilisateur = localStorage.getItem('nomUtilisateur') || 'Utilisateur';
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/connexion']);
  }
}