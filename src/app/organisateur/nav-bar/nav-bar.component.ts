import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { EvenementDTO } from '../../core/model/EvenementDTO';
import { Categorie } from '../../core/enumeration/Categorie';
import { EvenementService } from '../../core/service/evenement.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Status } from '../../core/enumeration/Status';
import { NotificationService } from '../../core/service/notification.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterLinkActive],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
})
export class NavBarComponent implements OnInit {
  evenementForm: FormGroup;
  billetForm: FormGroup;
  categories = Object.values(Categorie);
  imagePreview: string | ArrayBuffer | null = null;
  isLoading = false;
  nomUtilisateur: string | null = '';
  notificationsCount = 1;
  idUtilisateur: number | null = null;
  notificationCount$: Observable<number>;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private evenementService: EvenementService,
    private snackBar: MatSnackBar,
    private notificationService: NotificationService
  ) {
    this.evenementForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3)]],
      date: ['', Validators.required],
      heure: ['', Validators.required],
      description: ['', Validators.required],
      lieu: ['', Validators.required],
      categorie: [Categorie.SPORTS, Validators.required],
      nombrePlaces: [null, [Validators.required, Validators.min(1)]],
      image: [null, Validators.required],
      billets: this.fb.array([]),
    });

    this.billetForm = this.fb.group({
      typeBillet: ['', Validators.required],
      prix: [null, [Validators.required, Validators.min(0)]],
      quantite: [null, [Validators.required, Validators.min(1)]],
    });

    this.notificationCount$ = this.notificationService.notificationsCount$;
  }

  ngOnInit(): void {
    this.nomUtilisateur = localStorage.getItem('nomUtilisateur') || 'Utilisateur';
    const idUtilisateurStr = localStorage.getItem('idUtilisateur');
    this.idUtilisateur = idUtilisateurStr ? Number(idUtilisateurStr) : null;
  }

  get billets(): FormArray {
    return this.evenementForm.get('billets') as FormArray;
  }

  addBillet(): void {
    if (this.billetForm.invalid) {
      this.markBilletFormAsTouched();
      return;
    }

    const newBillet = {
      typeBillet: this.billetForm.value.typeBillet,
      prix: Number(this.billetForm.value.prix),
      quantite: Number(this.billetForm.value.quantite),
    };

    this.billets.push(this.fb.group(newBillet));
    this.billetForm.reset();
  }

  private markBilletFormAsTouched(): void {
    Object.values(this.billetForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  removeBillet(index: number): void {
    this.billets.removeAt(index);
  }

  onSubmit(): void {
    if (this.evenementForm.invalid || !this.idUtilisateur) return;
  
    this.isLoading = true;
  
    // Create EvenementDTO object
    const evenementDTO: EvenementDTO = {
      id_evenement: 0, // Will be assigned by the backend
      nom: this.evenementForm.get('nom')?.value,
      date: this.evenementForm.get('date')?.value,
      description: this.evenementForm.get('description')?.value,
      lieu: this.evenementForm.get('lieu')?.value,
      categorie: this.evenementForm.get('categorie')?.value,
      status: Status.EN_ATTENTE, // Set default status
      nombrePlaces: this.evenementForm.get('nombrePlaces')?.value,
      billets: this.billets.value,
      imageUrl: '', // Will be handled by the backend
      heure: this.evenementForm.get('heure')?.value
    };
  
    // Create FormData and append parts
    const formData = new FormData();
    formData.append('evenement', new Blob([JSON.stringify(evenementDTO)], { type: 'application/json' }));
  
    const imageFile = this.evenementForm.get('image')?.value;
    if (imageFile) {
      formData.append('image', imageFile);
    }
  
    // Send request with idUtilisateur as a query parameter
    this.evenementService.createEvenement(formData, this.idUtilisateur).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.snackBar.open('Événement créé avec succès !', 'Fermer', { duration: 5000 });
        this.resetForm();
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open(`Erreur: ${error.message}`, 'Fermer', { duration: 5000 });
      },
    });
  }
  resetForm(): void {
    this.evenementForm.reset({
      categorie: Categorie.SPORTS,
    });
    this.billets.clear();
    this.imagePreview = null;
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.evenementForm.patchValue({ image: file });
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  getBilletControl(index: number, controlName: string): FormControl {
    return this.billets.at(index).get(controlName) as FormControl;
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/connexion']);
  }
}