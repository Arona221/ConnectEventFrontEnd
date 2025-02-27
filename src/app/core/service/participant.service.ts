import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BilletParticipant} from '../model/participant.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ParticipantService {
    private apiUrl = `${environment.apiUrl}/billets`;

  constructor(private http: HttpClient) { }

  getBilletsByParticipantId(participantId: number): Observable<BilletParticipant[]> {
    return this.http.get<BilletParticipant[]>(`${this.apiUrl}/participant/${participantId}`);
  }

  annulerBillet(billetId: number, participantId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/annuler/${billetId}`, null, {
      params: { participantId: participantId.toString() }
    });
  }

  generateTicketPDF(billetId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${billetId}/generate-ticket`, {
      responseType: 'blob',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
  }
}