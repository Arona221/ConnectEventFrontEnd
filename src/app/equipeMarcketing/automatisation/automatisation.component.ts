import { Component, OnInit, NO_ERRORS_SCHEMA } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MarketingService } from '../../core/service/marketing.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-automatisation',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgxMaterialTimepickerModule,
    MatIconModule
  ],
  schemas: [NO_ERRORS_SCHEMA],
  templateUrl: './automatisation.component.html',
  styleUrl: './automatisation.component.scss'
})
export class AutomatisationComponent implements OnInit {
  isMenuOpen = false;
  nomUtilisateur: string | null = '';
  planificationForm: FormGroup;
  campagnesPlanifiees: any[] = [];
  selectedCampagneId: number | null = null;

  constructor(private router: Router,
    private fb: FormBuilder,
    private marketingService: MarketingService,
    private snackBar: MatSnackBar) {
    this.nomUtilisateur = localStorage.getItem('nomUtilisateur');
    this.planificationForm = this.fb.group({
      campagneId: ['', Validators.required],
      date: ['', Validators.required],
      heure: ['', Validators.required]
    });
    
  }
  
  ngOnInit(): void {
    this.loadCampagnesPlanifiees();
  }
  loadCampagnesPlanifiees(): void {
    // Chargement des campagnes avec statut "Planifier"
    this.marketingService.getCampagnesByStatut('Planifier').subscribe({
      next: (planifierData) => {
        // Chargement des campagnes avec statut "Programmer"
        this.marketingService.getCampagnesByStatut('Programmer').subscribe({
          next: (programmerData) => {
            // Combiner les deux types de campagnes
            this.campagnesPlanifiees = [...planifierData, ...programmerData];
          },
          error: (err) => console.error('Erreur de chargement des campagnes programmées', err)
        });
      },
      error: (err) => console.error('Erreur de chargement des campagnes en attente', err)
    });
  }
  planifierCampagne(id: number | null): void {
    if (this.planificationForm.valid && id) {
      const request = {
        date: this.planificationForm.value.date,
        heure: this.planificationForm.value.heure
      };

      this.marketingService.planifierCampagne(id, request).subscribe({
        next: () => {
          this.snackBar.open('Campagne planifiée avec succès!', 'Fermer', { duration: 3000 });
          this.loadCampagnesPlanifiees();
        },
        error: (err) => this.snackBar.open('Erreur lors de la planification', 'Fermer')
      });
    }
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/connexion']);
  }

  getTimeUntilPublication(campagne: any): number {
    const publicationDate = new Date(campagne.datePublicationPlanifiee);
    return Math.max(0, Math.floor((publicationDate.getTime() - new Date().getTime()) / 1000));
  }

  handleCountdownEvent(event: any, campagne: any): void {
    if (event.action === 'done') {
      this.loadCampagnesPlanifiees();
    }
  }

  get programmedCampagnes(): any[] {
    return this.campagnesPlanifiees.filter(c => c.statut === 'Programmer');
  }
}
