import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastrService } from 'ngx-toastr';

export interface Reservation {
  id: number;
  idOrganisateur: number;
  idRessource: number;
  statut: 'EN_ATTENTE' | 'CONFIRMER' | 'ANNULLER' | 'PASSER';
  totalPrice: number;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  nom?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private apiUrl = `${environment.apiUrl}/ressources`;

  constructor(private http: HttpClient, private toastr: ToastrService) {}

  /**
   * Récupère toutes les réservations d'un organisateur.
   * @param userId - L'ID de l'organisateur.
   * @returns Un Observable contenant la liste des réservations.
   */
  getReservationsByOrganisateur(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/utilisateur/${userId}`);
  }

  /**
   * Annule une réservation.
   * @param reservationId - L'ID de la réservation à annuler.
   * @returns Un Observable indiquant le succès ou l'échec de l'opération.
   */
  annulerReservation(reservationId: number, organisateurId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${reservationId}/annuler?organisateurId=${organisateurId}`);
  }
  
  

  /**
   * Met à jour le statut d'une réservation.
   * @param reservationId - L'ID de la réservation.
   * @param nouveauStatut - Le nouveau statut à appliquer.
   * @returns Un Observable contenant la réservation mise à jour.
   */
  updateStatutReservation(reservationId: number, nouveauStatut: string): Observable<Reservation> {
    return this.http.put<Reservation>(`${this.apiUrl}/${reservationId}/statut`, { statut: nouveauStatut });
  }

  supprimerReservation(reservationId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${reservationId}`);
  }
  
}