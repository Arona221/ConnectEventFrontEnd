import { Injectable } from '@angular/core';
import { JwtHelperService as JwtHelper } from '@auth0/angular-jwt';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class JwtHelperService {
  constructor(private jwtHelper: JwtHelper, private router: Router) {}

  checkTokenExpiration() {
    const token = localStorage.getItem('authToken');

    if (token && this.jwtHelper.isTokenExpired(token)) {
      console.log('Le jeton est expiré');
      localStorage.removeItem('authToken'); // Supprimer le jeton expiré
      this.router.navigate(['/connexion']); // Rediriger vers la page de connexion
    }
  }
}