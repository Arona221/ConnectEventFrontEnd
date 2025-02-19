import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EvenementService } from '../../core/service/evenement.service';
import { EvenementDTO } from '../../core/model/EvenementDTO';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../core/service/notification.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-consulter',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './consulter.component.html',
  styleUrls: ['./consulter.component.scss']
})
export class ConsulterComponent implements OnInit {
  evenement?: EvenementDTO;
  baseImageUrl = 'http://localhost:8081/api/ConnectEvent/uploads/'; // URL de base pour les images
  nomUtilisateur: string | null = '';
  notificationsCount = 1;
  notificationCount$: Observable<number>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private evenementService: EvenementService,
    private notificationService: NotificationService
  ) {
    this.notificationCount$ = this.notificationService.notificationsCount$;
  }

  ngOnInit(): void {
    this.nomUtilisateur = localStorage.getItem('nomUtilisateur') || 'Utilisateur';
    this.loadEvenement();
  }

  loadEvenement(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.evenementService.getEvenementById(+id).subscribe({
        next: (data) => {
          this.evenement = data;
          // Construire l'URL complète de l'image
          if (this.evenement.imageUrl) {
            this.evenement.imageUrl = `${this.baseImageUrl}${this.evenement.imageUrl}`;
            console.log('URL de l\'image:', this.evenement.imageUrl); // Débogage
          }
        },
        error: () => this.router.navigate(['/not-found'])
      });
    }
  }

  getStatusClass(status?: string): string {
    switch (status?.toUpperCase()) {
      case 'EN_ATTENTE': return 'bg-warning text-dark';
      case 'APPROUVE': return 'bg-success text-white';
      case 'EN_COURS': return 'bg-info text-white';
      case 'TERMINE': return 'bg-primary text-white';
      case 'ANNULE': return 'bg-danger text-white';
      default: return 'bg-secondary text-white';
    }
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/connexion']);
  }
}