import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EvenementDTO } from '../model/EvenementDTO';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EvenementService {
  private apiUrl = environment.apiUrl + '/evenements';

  constructor(private http: HttpClient) {}

  createEvenement(evenementDTO: EvenementDTO, idUtilisateur: number): Observable<EvenementDTO> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    return this.http.post<EvenementDTO>(
      `${this.apiUrl}?idUtilisateur=${idUtilisateur}`,
      evenementDTO,
      { headers }
    );
  }
}
