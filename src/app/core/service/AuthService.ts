import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError } from 'rxjs';
import { InscriptionDTO } from '../model/InscriptionDTO';
import { ValidationCompteDTO } from '../model/ValidationCompteDTO';
import { TokenDTO } from '../model/TokenDTO';
import { ConnexionDTO } from '../model/ConnexionDTO';
import { ConnexionResponseDTO } from '../model/ConnexionResponseDTO';
import { environment } from '../../../environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { ForgotPasswordRequest, ResetPasswordRequest, ApiResponse } from '../model/password-reset';
import { MatSnackBar } from '@angular/material/snack-bar';
import { throwError } from 'rxjs';


@Injectable({
  providedIn: 'root',
})

export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient, 
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

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

  forgotPassword(request: ForgotPasswordRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/forgot-password`, request).pipe(
      tap((response) => {
        // Vérifier si la réponse existe avant d'essayer d'accéder à ses propriétés
        if (response) {
          this.snackBar.open(response.message || 'Un code de vérification a été envoyé à votre email', 
                            'Fermer', { duration: 5000 });
        } else {
          // Gérer la réponse null mais supposer quand même un succès
          this.snackBar.open('Un code de vérification a été envoyé à votre email', 
                            'Fermer', { duration: 5000 });
        }
        this.router.navigate(['/reInitialiser']);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Erreur détaillée:', error);
        
        let errorMessage = 'Erreur serveur inconnue';
        
        if (error.error instanceof ErrorEvent) {
          // Erreur côté client
          errorMessage = `Erreur: ${error.error.message}`;
        } else {
          // Erreur côté serveur
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else {
            errorMessage = error.statusText || 'Erreur lors de la demande';
          }
        }
        
        this.snackBar.open(errorMessage, 'Fermer', {
          duration: 7000,
          panelClass: ['error-snackbar']
        });
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }
  
  resetPassword(request: ResetPasswordRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/reset-password`, request).pipe(
      tap((response) => {
        // Check if response exists before trying to access its properties
        if (response) {
          this.snackBar.open(response.message || 'Mot de passe réinitialisé avec succès', 
                           'Fermer', { duration: 5000 });
        } else {
          // Handle null response but still assume success
          this.snackBar.open('Mot de passe réinitialisé avec succès', 
                           'Fermer', { duration: 5000 });
        }
        this.router.navigate(['/connexion']);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Erreur détaillée:', error);
        
        let errorMessage = 'Erreur serveur inconnue';
        
        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Erreur: ${error.error.message}`;
        } else {
          // Server-side error
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else {
            errorMessage = error.statusText || 'Erreur lors de la réinitialisation';
          }
        }
        
        this.snackBar.open(errorMessage, 'Fermer', {
          duration: 7000,
          panelClass: ['error-snackbar']
        });
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('nomUtilisateur');
    localStorage.removeItem('emailUtilisateur');
    this.router.navigate(['/connexion']);
  }
  
}