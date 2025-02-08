import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getProtectedData(): Observable<any> {
    // Récupérer le jeton du local storage
    const token = localStorage.getItem('authToken');

    // Ajouter le jeton à l'en-tête Authorization
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get(`${this.apiUrl}/protected`, { headers });
  }
}