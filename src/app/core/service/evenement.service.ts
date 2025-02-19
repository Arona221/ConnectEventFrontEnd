import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, Observable, Subject, tap, throwError } from 'rxjs';
import { EvenementDTO } from '../model/EvenementDTO';
import { environment } from '../../../environments/environment';
import { Page } from '../model/Page';

@Injectable({
  providedIn: 'root',
})
export class EvenementService {
  private apiUrl = environment.apiUrl + '/evenements';
  private apiUrl1 = environment.apiUrl + '/favoris';
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
  // Méthode utilitaire pour formater les URLs d'images
 
getImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) {
    return 'assets/images/addimage.png';
  }
  // Supprimer les slash initiaux et ajouter le base URL
  const cleanPath = imagePath.replace(/^\/+/, '');
  return `${environment.imageBaseUrl}${cleanPath}`;
}
  getApprovedEvents(
    page: number,
    size: number,
    search?: string,
    categorie?: string,
    date?: Date,
    lieu?: string
  ): Observable<Page<EvenementDTO>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (search) params = params.set('search', search);
    if (categorie) params = params.set('categorie', categorie);
    if (date) params = params.set('date', date.toISOString().split('T')[0]); // Format YYYY-MM-DD
    if (lieu) params = params.set('lieu', lieu);

    return this.http.get<Page<EvenementDTO>>(`${this.apiUrl}/approved`, { params })
      .pipe(
        catchError(error => {
          console.error('Error fetching events:', error);
          return throwError(() => error);
        })
      );
  }
  
addToFavorites(idUtilisateur: number, idEvenement: number): Observable<any> {
  const token = localStorage.getItem('authToken');
  const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
  const params = new HttpParams()
    .set('idUtilisateur', idUtilisateur.toString())
    .set('idEvenement', idEvenement.toString());

  return this.http.post(`${this.apiUrl1}`, {}, { headers, params }).pipe(
    tap(() => this.favoritesUpdated.next()) );
}

removeFromFavorites(idUtilisateur: number, idEvenement: number): Observable<any> {
  const token = localStorage.getItem('authToken');
  const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
  const params = new HttpParams()
    .set('idUtilisateur', idUtilisateur.toString())
    .set('idEvenement', idEvenement.toString());

  return this.http.delete(`${this.apiUrl1}`, { headers, params }).pipe(
    tap(() => this.favoritesUpdated.next())
  );
}

getFavoriteStatus(idEvenement: number): Observable<boolean> {
  const idUtilisateur = Number(localStorage.getItem('idUtilisateur'));
  const token = localStorage.getItem('authToken');
  const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
  
  return this.http.get<boolean>(`${this.apiUrl1}/status`, {
    params: {
      idUtilisateur: idUtilisateur.toString(),
      idEvenement: idEvenement.toString()
    },
    headers
  });
}
getFavoritesByUser(idUtilisateur: number, page: number, size: number): Observable<Page<EvenementDTO>> {
  const token = localStorage.getItem('authToken');
  const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

  const params = new HttpParams()
    .set('idUtilisateur', idUtilisateur.toString()) // Changez le nom du paramètre
    .set('page', page.toString())
    .set('size', size.toString());

  return this.http.get<Page<EvenementDTO>>(`${this.apiUrl1}`, { headers, params }).pipe(
    tap(response => {
      localStorage.setItem('favoritesCache', JSON.stringify({
        timestamp: Date.now(),
        data: response
      }));
    })
  );
}
private favoritesUpdated = new Subject<void>();

// Méthode pour obtenir l'observable
get favoritesUpdated$() {
  return this.favoritesUpdated.asObservable();
}
 
 
}
