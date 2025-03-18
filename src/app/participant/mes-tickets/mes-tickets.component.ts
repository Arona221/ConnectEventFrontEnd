import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { RouterLink } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BilletParticipant } from '../../core/model/participant.model';
import { ParticipantService } from '../../core/service/participant.service';
import { NotificationService } from '../../core/service/notification.service';
import { Subscription } from 'rxjs';

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
    RouterLinkActive,
  ],
  templateUrl: './mes-tickets.component.html',
  styleUrl: './mes-tickets.component.scss',
  providers: [DatePipe]
})
export class MesTicketsComponent implements OnInit, OnDestroy {
  nomUtilisateur: string | null = '';
  billets: BilletParticipant[] = [];
  loading = true;
  participantId: number;
  isGridView = true;
  private countSubscription!: Subscription;
  notificationsCount: number = 0;
  notifications: { read: boolean }[] = [];

  constructor(
    private router: Router,
    public participantService: ParticipantService,
    public datePipe: DatePipe,
    private snackBar: MatSnackBar,
    private notificationService: NotificationService
  ) {
    this.nomUtilisateur = localStorage.getItem('nomUtilisateur') || 'Utilisateur';
    this.participantId = Number(localStorage.getItem('idUtilisateur'));
    
  }
  ngOnInit(): void {
    this.loadBillets();
    this.countSubscription = this.notificationService.notificationCount$
      .subscribe(count => {
        this.notificationsCount = count;
      });

      this.loadNotifications();

    this.countSubscription = this.notificationService.notificationCount$
    .subscribe(count => {
      // Mettre à jour le badge de la navbar
      this.notificationsCount = count;
    });
  }
  private loadNotifications(): void {
    const userId = parseInt(localStorage.getItem('idUtilisateur') || '0', 10);
    this.notificationService.getNotifications(userId).subscribe({
      next: (data) => {
        this.notifications = data;
        this.updateUnreadCount();
      },
      error: (err) => console.error('Error loading notifications:', err)
    });
  }

  ngOnDestroy(): void {
    if (this.countSubscription) {
      this.countSubscription.unsubscribe();
    }
  }

  loadBillets(): void {
    this.participantService.getBilletsByParticipantId(this.participantId).subscribe({
      next: (data) => {
        // Ajouter une validation des données
        this.billets = data.map(b => ({
          ...b,
          id: b.id || 0 // Valeur par défaut si null
        }));
        console.log('Billets chargés:', this.billets); // Debug
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur de chargement:', err);
        this.snackBar.open('Erreur lors du chargement des billets', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  convertToNumber(value: string): number {
    return Number(value); // Convert string to number
  }

  getDirections(lieu: string): void {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(lieu)}`;
    window.open(url, '_blank');
  }

  annulerBillet(billetId: number): void {
    if (confirm('Voulez-vous vraiment annuler ce billet ?')) {
      this.participantService.annulerBillet(billetId, this.participantId).subscribe({
        next: () => {
          this.loadBillets();
          this.snackBar.open('Billet annulé avec succès', 'Fermer', { duration: 3000 });
        },
        error: (err) => {
          this.snackBar.open("Erreur lors de l'annulation", 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  downloadTicket(billet: BilletParticipant): void {
    if (!billet?.id || isNaN(billet.id)) {
      console.error('ID de billet invalide:', billet);
      this.snackBar.open('Erreur: Billet corrompu', 'Fermer', { duration: 3000 });
      return;
    }
  
    this.participantService.generateTicketPDF(billet.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ticket-${billet.referenceTransaction}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.snackBar.open('Erreur lors du téléchargement', 'Fermer', { duration: 3000 });
      }
    });
  }

  getStatusColor(statut: string): string {
    switch (statut) {
      case 'PAYE': return 'bg-success';
      case 'ANNULÉ': return 'bg-danger';
      case 'PASSÉ': return 'bg-secondary';
      default: return 'bg-warning';
    }
  }
  
  private updateUnreadCount(): void {
    const count = this.notifications.filter(n => !n.read).length;
    this.notificationService.updateUnreadCount(count);
  }


  logout() {
    localStorage.clear();
    this.router.navigate(['/connexion']);
  }
}
