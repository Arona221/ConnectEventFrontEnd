import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/service/AuthService';
import { NgIf } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar'; // Importez MatSnackBar

@Component({
  selector: 'app-creation-compte',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  templateUrl: './creation-compte.component.html',
  styleUrls: ['./creation-compte.component.scss'],
})
export class CreationCompteComponent {
  inscriptionForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar // Injectez MatSnackBar
  ) {
    this.inscriptionForm = this.fb.group({
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(8)]],
      phoneNumber: ['', [Validators.required, Validators.minLength(9)]],
      typeUtilisateur: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.inscriptionForm.valid) {
      this.authService.inscription(this.inscriptionForm.value).subscribe({
        next: (response) => {
          console.log('Inscription réussie', response);

          // Afficher un popup de succès
          this.snackBar.open('Compte créé avec succès ! Un email vous a été envoyé', 'Fermer', {
            duration: 5000, // Durée d'affichage du popup (5 secondes)
            panelClass: ['success-snackbar'], // Classe CSS pour le style
          });

          // Rediriger vers la page de connexion
          this.router.navigate(['/validation']);
        },
        error: (err) => {
          console.error('Erreur lors de l\'inscription', err);
          this.errorMessage = 'Une erreur s\'est produite lors de l\'inscription. Veuillez réessayer.';
        },
      });
    }
  }
}