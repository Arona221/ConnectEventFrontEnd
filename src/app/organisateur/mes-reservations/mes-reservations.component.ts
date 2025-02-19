import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ReservationService } from '../../core/service/reservation.service';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NotificationService } from '../../core/service/notification.service';
import { Observable } from 'rxjs';

interface Reservation {
  id: number;
  idOrganisateur: number;
  idRessource: number;
  statut: 'EN_ATTENTE' | 'CONFIRMER' | 'ANNULLER' | 'PASSER';
  totalPrice: number;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
}

@Component({
  selector: 'app-mes-reservations',
  templateUrl: './mes-reservations.component.html',
  styleUrls: ['./mes-reservations.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ]
})
export class MesReservationsComponent implements OnInit {
  reservations: Reservation[] = [];
  isLoading = false;
  notificationsCount = 0;
  notificationCount$: Observable<number>;
  nomUtilisateur: string = localStorage.getItem('nomUtilisateur') || 'Utilisateur';
  viewMode: 'grid' | 'list' = 'grid'; 

  constructor(
    private reservationService: ReservationService,
    private toastr: ToastrService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.notificationCount$ = this.notificationService.notificationsCount$;
  }

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.isLoading = true;
    const userId = Number(localStorage.getItem('idUtilisateur'));
    
    this.reservationService.getReservationsByOrganisateur(userId).subscribe({
      next: (data) => {
        this.reservations = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error('Erreur lors du chargement des réservations');
        this.isLoading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    return status;
  }

  annulerReservation(reservationId: number): void {
    const organisateurId = Number(localStorage.getItem('idUtilisateur'));
    this.reservationService.annulerReservation(reservationId, organisateurId).subscribe({
      next: () => {
        this.toastr.success('Réservation annulée avec succès');
        this.loadReservations();
      },
      error: (err) => {
        this.toastr.error("Échec de l'annulation de la réservation : " + err.error.message);
      }
    });
  }

  supprimerReservation(reservationId: number): void {
    this.reservationService.supprimerReservation(reservationId).subscribe({
      next: () => {
        this.toastr.success('Réservation supprimée avec succès');
        this.loadReservations(); // Recharge la liste
      },
      error: (err) => {
        this.toastr.error("Échec de la suppression de la réservation");
      }
    });
  }
  
  

  refresh(): void {
    this.loadReservations();
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/connexion']);
  }
}