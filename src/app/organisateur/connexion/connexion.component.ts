import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/service/AuthService';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-connexion',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf,RouterLink],
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.scss'],
})
export class ConnexionComponent {
  connexionForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.connexionForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required]],
      seRappeler: [false],
    });
  }

  onSubmit() {
    if (this.connexionForm.valid) {
      const dto = {
        email: this.connexionForm.value.email,
        motDePasse: this.connexionForm.value.motDePasse,
      };
  
      this.authService.connexion(dto).subscribe({
        next: (response) => {
          console.log('Connexion réussie', response);
  
          // Vérifier si le token est bien défini
          if (response?.token) {
            localStorage.setItem('authToken', response.token.token || '');
            localStorage.setItem('nomUtilisateur', response.token.nom || 'Utilisateur');
            localStorage.setItem('emailUtilisateur', response.token.email || '');
  
            // Vérifier si idUtilisateur existe avant de le stocker
            if (response.token.idutilisateur !== undefined && response.token.idutilisateur !== null) {
              localStorage.setItem('idUtilisateur', response.token.idutilisateur.toString());
            } else {
              console.error('idUtilisateur manquant dans la réponse');
              this.snackBar.open('Erreur lors de la connexion. Veuillez réessayer.', 'Fermer', {
                duration: 5000,
                panelClass: ['error-snackbar'],
              });
              return; // Arrêter l'exécution si idUtilisateur est manquant
            }
  
            // Rediriger en fonction du type d'utilisateur
            switch (response.token.typeUtilisateur) {
              case 'ORGANISATEUR':
                this.router.navigate(['/acceuil-organisateur']);
                break;
              case 'PARTICIPANT':
                this.router.navigate(['/participant']);
                break;
              case 'EQUIPEMARKETING':
                this.router.navigate(['/acceuilEquipe-marketing']);
                break;
              default:
                console.error("Type d'utilisateur inconnu");
                this.snackBar.open("Erreur lors de la connexion. Veuillez réessayer.", "Fermer", {
                  duration: 5000,
                  panelClass: ['error-snackbar'],
                });
            }
          } else {
            console.error('Réponse API invalide : token manquant');
            this.snackBar.open('Erreur lors de la connexion. Veuillez réessayer.', 'Fermer', {
              duration: 5000,
              panelClass: ['error-snackbar'],
            });
          }
        },
        error: (err) => {
          console.error('Erreur lors de la connexion', err);
          this.snackBar.open('Email ou mot de passe incorrect.', 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar'],
          });
        },
      });
    }
  }
}