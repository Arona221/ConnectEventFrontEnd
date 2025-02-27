import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { FactureResponse } from '../model/FactureResponse';
import { PaiementResponse } from '../model/PaiementResponse';
import { BilletSelectionDTO } from '../model/billet-selection.model';

@Injectable({
  providedIn: 'root'
})
export class BilletService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  acheterBillets(billetDTO: BilletSelectionDTO): Observable<FactureResponse> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    
    return this.http.post<FactureResponse>(
      `${this.apiUrl}/billets/acheter`, 
      billetDTO, 
      { headers }
    );
  }

  verifierPaiement(referenceTransaction: string): Observable<PaiementResponse> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<PaiementResponse>(`${this.apiUrl}/billets/verifier/${referenceTransaction}`, { headers });
  }
}