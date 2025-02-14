import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EvenementService } from '../../core/service/evenement.service';
import { Categorie } from '../../core/enumeration/Categorie';
import { EvenementDTO } from '../../core/model/EvenementDTO';
import { Status } from '../../core/enumeration/Status';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-editer-evenement',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './editer-evenement.component.html',
  styleUrls: ['./editer-evenement.component.scss'],
})
export class EditerEvenementComponent implements OnInit {
  evenementForm: FormGroup;
  billetForm: FormGroup;
  categories = Object.values(Categorie);
  imagePreview: string | ArrayBuffer | null = null;
  isLoading = false;
  nomUtilisateur: string | null = '';
  notificationsCount = 1;
  idEvenement: number | null = null;
  initialFormValue: any;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private evenementService: EvenementService,
    private snackBar: MatSnackBar
  ) {
    this.evenementForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3)]],
      date: ['', Validators.required],
      heure: ['', Validators.required],
      description: ['', Validators.required],
      lieu: ['', Validators.required],
      categorie: [Categorie.SPORTS, Validators.required],
      nombrePlaces: [null, [Validators.required, Validators.min(1)]],
      image: [null],
      billets: this.fb.array([]),
    });

    this.billetForm = this.fb.group({
      typeBillet: ['', Validators.required],
      prix: [null, [Validators.required, Validators.min(0)]],
      quantite: [null, [Validators.required, Validators.min(1)]],
    });

    this.nomUtilisateur = localStorage.getItem('nomUtilisateur') || 'Utilisateur';
  }

  ngOnInit(): void {
    this.idEvenement = Number(this.route.snapshot.paramMap.get('id'));
    if (this.idEvenement) {
      this.loadEvenement(this.idEvenement);
    }

    // Sauvegarder la valeur initiale du formulaire
    this.initialFormValue = this.evenementForm.value;
  }

  loadEvenement(id: number): void {
    this.isLoading = true;
    this.evenementService.getEvenementById(id).subscribe({
      next: (evenement) => {
        this.patchFormWithEvenementData(evenement);
        this.isLoading = false;
      },
      error: (error) => {
        this.snackBar.open(`Erreur: ${error.message}`, 'Fermer', { duration: 5000 });
        this.isLoading = false;
      },
    });
  }

  patchFormWithEvenementData(evenement: EvenementDTO): void {
    this.evenementForm.patchValue({
      nom: evenement.nom,
      date: evenement.date,
      heure: evenement.heure,
      description: evenement.description,
      lieu: evenement.lieu,
      categorie: evenement.categorie,
      nombrePlaces: evenement.nombrePlaces,
    });

    if (evenement.imageUrl) {
      this.imagePreview = `${environment.apiUrl}/${evenement.imageUrl}`; // Chemin absolu
    }

    evenement.billets.forEach((billet) => {
      this.billets.push(
        this.fb.group({
          typeBillet: billet.typeBillet,
          prix: billet.prix,
          quantite: billet.quantite,
        })
      );
    });

    // Sauvegarder la valeur initiale après le patch
    this.initialFormValue = this.evenementForm.value;
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
    if (this.evenementForm.invalid || !this.idEvenement) return;

    this.isLoading = true;
    const imageFile = this.evenementForm.get('image')?.value;

    const evenementDTO: EvenementDTO = {
      id_evenement: this.idEvenement,
      nom: this.evenementForm.get('nom')?.value,
      date: this.evenementForm.get('date')?.value,
      heure: this.evenementForm.get('heure')?.value,
      description: this.evenementForm.get('description')?.value,
      lieu: this.evenementForm.get('lieu')?.value,
      categorie: this.evenementForm.get('categorie')?.value,
      status: Status.EN_ATTENTE,
      nombrePlaces: this.evenementForm.get('nombrePlaces')?.value,
      billets: this.billets.value,
    };

    this.evenementService.updateEvenement(this.idEvenement, evenementDTO, imageFile).subscribe({
      next: (response) => {
        if (response.imageUrl) {
          this.imagePreview = `${environment.apiUrl}/${response.imageUrl}`;
        }
        this.isLoading = false;
        this.snackBar.open('Événement modifié avec succès !', 'Fermer', { duration: 5000 });
        this.router.navigate(['/gerer-evenements']);
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open(`Erreur: ${error.message}`, 'Fermer', { duration: 5000 });
      },
    });
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

  isFormModified(): boolean {
    return JSON.stringify(this.evenementForm.value) !== JSON.stringify(this.initialFormValue);
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/connexion']);
  }

  resetForm(): void {
    this.evenementForm.reset({
      categorie: Categorie.SPORTS
    });
    this.billets.clear();
    this.imagePreview = null;
    this.evenementForm.get('image')?.setValue(null);
    this.initialFormValue = this.evenementForm.value;
  }
}