import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InscriptionDTO } from '../model/InscriptionDTO';
import { ValidationCompteDTO } from '../model/ValidationCompteDTO';
import { TokenDTO } from '../model/TokenDTO';
import { ConnexionDTO } from '../model/ConnexionDTO';
import { ConnexionResponseDTO } from '../model/ConnexionResponseDTO';
import { environment } from '../../../environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root',
})

export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient, private router: Router) {}

  inscription(dto: InscriptionDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/inscription`, dto);
  }

  validerCompte(dto: ValidationCompteDTO): Observable<TokenDTO> {
    return this.http.post<TokenDTO>(`${this.apiUrl}/valider`, dto);
  }
  connexion(dto: ConnexionDTO): Observable<ConnexionResponseDTO> {
    return this.http.post<ConnexionResponseDTO>(`${this.apiUrl}/connexion`, dto);
  }
  private jwtHelper = new JwtHelperService();


  checkTokenExpiration() {
    const token = localStorage.getItem('authToken');

    if (token && this.jwtHelper.isTokenExpired(token)) {
      console.log('Le jeton est expiré');
      this.logout();
    }
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('nomUtilisateur');
    localStorage.removeItem('emailUtilisateur');
    this.router.navigate(['/connexion']);
  }
}