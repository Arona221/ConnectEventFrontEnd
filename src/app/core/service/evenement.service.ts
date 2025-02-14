import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EvenementDTO } from '../model/EvenementDTO';
import { environment } from '../../../environments/environment';
import { Page } from '../model/Page';

@Injectable({
  providedIn: 'root',
})
export class EvenementService {
  private apiUrl = environment.apiUrl + '/evenements';
  private idUtilisateur = Number(localStorage.getItem('idUtilisateur'));

  constructor(private http: HttpClient) {}

  createEvenement(formData: FormData, idUtilisateur: number): Observable<EvenementDTO> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const params = new HttpParams().set('idUtilisateur', idUtilisateur.toString());
    
    return this.http.post<EvenementDTO>(`${this.apiUrl}`, formData, { headers, params });
  }
  getEvenementsByOrganisateur(
    idOrganisateur: number, 
    page: number, 
    size: number, 
    search?: string,
    status?: string
  ): Observable<Page<EvenementDTO>> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
  
    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
  
    return this.http.get<Page<EvenementDTO>>(
      `${this.apiUrl}/organisateur/${idOrganisateur}`,
      { headers, params }
    );
  }

  deleteEvenement(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  // evenement.service.ts
  updateEvenement(id: number, evenement: EvenementDTO, imageFile?: File): Observable<EvenementDTO> {
    const formData = new FormData();
    const idUtilisateur = Number(localStorage.getItem('idUtilisateur'));
    
    // Ajout des paramètres au FormData
    formData.append('idUtilisateur', idUtilisateur.toString());
    formData.append('evenement', new Blob([JSON.stringify(evenement)], { 
      type: 'application/json'
    }));
    
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.put<EvenementDTO>(
      `${this.apiUrl}/${id}`,
      formData,
      { headers }
    );
  }
  getEvenementById(id: number): Observable<EvenementDTO> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<EvenementDTO>(`${this.apiUrl}/${id}`, { headers });
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
  
}
