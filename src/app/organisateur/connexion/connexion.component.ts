import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/service/AuthService';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConnexionDTO } from '../../core/model/ConnexionDTO';
import { ConnexionResponseDTO } from '../../core/model/ConnexionResponseDTO';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-connexion',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
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
    });
  }

  onSubmit() {
    if (this.connexionForm.valid) {
      const dto: ConnexionDTO = {
        email: this.connexionForm.value.email,
        motDePasse: this.connexionForm.value.motDePasse,
      };

      this.authService.connexion(dto).subscribe({
        next: (response) => {
          console.log('Connexion réussie', response);

          // Stocker le jeton dans le local storage
          localStorage.setItem('authToken', response.token.token);

          // Afficher un message de succès
          this.snackBar.open('Connexion réussie !', 'Fermer', {
            duration: 5000,
            panelClass: ['success-snackbar'],
          });

          // Rediriger vers la page d'accueil ou une autre page
          this.router.navigate(['/acceuilOganisteur']);
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