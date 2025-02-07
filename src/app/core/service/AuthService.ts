import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InscriptionDTO } from '../model/InscriptionDTO';
import { ValidationCompteDTO } from '../model/ValidationCompteDTO';
import { TokenDTO } from '../model/TokenDTO';
import { ConnexionDTO } from '../model/ConnexionDTO';
import { ConnexionResponseDTO } from '../model/ConnexionResponseDTO';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  inscription(dto: InscriptionDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/inscription`, dto);
  }

  validerCompte(dto: ValidationCompteDTO): Observable<TokenDTO> {
    return this.http.post<TokenDTO>(`${this.apiUrl}/valider`, dto);
  }
  connexion(dto: ConnexionDTO): Observable<ConnexionResponseDTO> {
    return this.http.post<ConnexionResponseDTO>(`${this.apiUrl}/connexion`, dto);
  }
}