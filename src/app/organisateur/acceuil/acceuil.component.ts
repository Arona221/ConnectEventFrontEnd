import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/service/notification.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-acceuil',
  standalone: true,
  imports: [RouterModule, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './acceuil.component.html',
  styleUrls: ['./acceuil.component.scss']
})
export class AcceuilComponent {
  nomUtilisateur: string | null = '';
  notificationsCount = 1;
  notificationCount$: Observable<number>;

  constructor(private router: Router, private notificationService: NotificationService) {
    this.nomUtilisateur = localStorage.getItem('nomUtilisateur') || 'Utilisateur';
    this.notificationCount$ = this.notificationService.notificationsCount$;
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/connexion']);
  }
}
