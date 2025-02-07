import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/service/AuthService';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ValidationCompteDTO } from '../../core/model/ValidationCompteDTO';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-validation',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './validation.component.html',
  styleUrls: ['./validation.component.scss'],
})
export class ValidationComponent {
  validationForm: FormGroup;
  codeControls: FormArray;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.codeControls = this.fb.array(
      Array(6).fill(null).map(() => new FormControl('', [Validators.required, Validators.pattern('^[0-9]$')]))
    );

    this.validationForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      code: this.codeControls,
    });
  }

  /**
   * Gère le déplacement automatique entre les champs OTP
   */
  handleKey(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;
    const nextInput = document.getElementById(`otp${index + 1}`) as HTMLInputElement;
    const prevInput = document.getElementById(`otp${index - 1}`) as HTMLInputElement;

    if (event.key.match(/^[0-9]$/)) {
      input.value = event.key;
      this.codeControls.at(index).setValue(event.key);
      if (nextInput) {
        setTimeout(() => nextInput.focus(), 100);
      }
    } else if (event.key === 'Backspace') {
      input.value = '';
      this.codeControls.at(index).setValue('');
      if (prevInput) {
        setTimeout(() => prevInput.focus(), 100);
      }
    } else {
      event.preventDefault(); // Empêche d'autres caractères
    }
  }

  /**
   * Soumet le formulaire
   */
  onSubmit() {
    if (this.validationForm.valid) {
      const dto: ValidationCompteDTO = {
        email: this.validationForm.value.email,
        code: this.codeControls.value.join(''),
      };

      this.authService.validerCompte(dto).subscribe({
        next: (response) => {
          localStorage.setItem('authToken', response.token);
          this.snackBar.open('Compte validé avec succès !', 'Fermer', { duration: 5000, panelClass: ['success-snackbar'] });
          this.router.navigate(['/connexion']);
        },
        error: () => {
          this.snackBar.open('Erreur de validation. Veuillez réessayer.', 'Fermer', { duration: 5000, panelClass: ['error-snackbar'] });
        },
      });
    }
  }
}
