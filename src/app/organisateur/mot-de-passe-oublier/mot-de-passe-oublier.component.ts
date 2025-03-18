// components/mot-de-passe-oublier.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgIf } from '@angular/common';
import { AuthService } from '../../core/service/AuthService';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-mot-de-passe-oublier',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatProgressSpinnerModule, NgIf, MatFormFieldModule,
    MatInputModule,
    MatButtonModule, MatIconModule,],
  templateUrl: './mot-de-passe-oublier.component.html',
  styleUrls: ['./mot-de-passe-oublier.component.scss']
})
export class MotDePasseOublierComponent {
  form: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

 
  submit() {
    if (this.form.valid && !this.isLoading) {
      this.isLoading = true;
      this.authService.forgotPassword(this.form.value).subscribe({
        next: () => {
          // La navigation est maintenant gérée dans le service
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Gestionnaire d\'erreur du composant:', err);
          this.isLoading = false;
          
          // Si vous recevez toujours l'email malgré les erreurs, vous pourriez vouloir naviguer quand même
          // Décommentez ceci si nécessaire:
          // this.router.navigate(['/reInitialiser']);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }
}