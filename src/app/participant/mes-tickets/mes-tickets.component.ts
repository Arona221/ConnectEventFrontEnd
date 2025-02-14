import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { RouterLink } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mes-tickets',
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
  templateUrl: './mes-tickets.component.html',
  styleUrl: './mes-tickets.component.scss'
})
export class MesTicketsComponent {
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
