import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MarketingService } from '../../core/service/marketing.service';
import { CampagneMarketingUpdate } from '../../core/model/campagne-marketing-update.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-publier-campagne',
  templateUrl: './publier-campagne.component.html',
  styleUrls: ['./publier-campagne.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive]
})
export class PublierCampagneComponent implements OnInit {
  campagnes: CampagneMarketingUpdate[] = [];
  isMenuOpen = false;
  nomUtilisateur: string | null = '';
  isLoading = true;
  isActionLoading = false;
  successMessage = '';
  viewMode: 'grid' | 'list' = 'grid';

  constructor(
    private router: Router,
    private marketingService: MarketingService,
    private snackBar: MatSnackBar ) {}

  ngOnInit(): void {
    this.nomUtilisateur = localStorage.getItem('nomUtilisateur');
    this.loadCampagnes();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
  // Charger les campagnes
  loadCampagnes(): void {
    this.isLoading = true;
    this.marketingService.getCampagnes().subscribe({
      next: (data) => {
        this.campagnes = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement campagnes:', err);
        this.isLoading = false;
      }
    });
  }


  // Publier une campagne
  publierCampagne(id: number): void {
    this.isActionLoading = true;
    this.marketingService.publierCampagne(id).subscribe({
      next: () => {
        this.loadCampagnes(); // Recharger les campagnes
        this.showSuccess('Campagne publiée avec succès !');
        this.isActionLoading = false;
      },
      error: (err) => {
        console.error('Erreur publication:', err);
        this.isActionLoading = false;
      }
    });
  }
  // Afficher un message de succès
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 4000,
      panelClass: ['success-snackbar']
    });
  }

  // Supprimer une campagne
  supprimerCampagne(id: number): void {
    this.marketingService.supprimerCampagne(id).subscribe({
      next: () => {
        this.loadCampagnes(); // Recharger les campagnes
        this.showSuccess('Campagne supprimée avec succès !');
      },
      error: (err) => console.error('Erreur suppression:', err)
    });
  }
  // Basculer entre l'affichage en grille et en liste
  toggleView(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }
  logout(): void {
    localStorage.clear();
    this.router.navigate(['/connexion']);
  }
}