import { Component, OnInit, OnDestroy } from '@angular/core';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { MarketingService } from '../../core/service/marketing.service';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { Chart, ChartConfiguration, ChartOptions } from 'chart.js/auto';

@Component({
  selector: 'app-acceuil-marketing',
  imports: [RouterLinkActive, RouterLink, CommonModule],
  animations: [
    trigger('cardAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.6s cubic-bezier(0.23, 1, 0.32, 1)', 
          style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('0.3s ease-out', 
          style({ opacity: 0, transform: 'translateY(-20px)' }))
      ])
    ]),
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.5s ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('0.5s ease-out', style({ opacity: 0 }))
      ])
    ])
  ],
  templateUrl: './acceuil-marketing.component.html',
  styleUrls: ['./acceuil-marketing.component.scss'],
  providers: [MarketingService]
})
export class AcceuilMarketingComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  nomUtilisateur: string | null = '';
  activeCampagnesCount: number = 0;
  
  // Stocker toutes les campagnes regroupées par statut
  allCampagnes: { [key: string]: any[] } = {};
  
  // Campagnes actuellement affichées
  displayedCampagnes: { [key: string]: any } = {
    'En_cours': null,
    'Planifier': null,
    'Terminee': null
  };
  
  // Index actuels pour chaque statut
  currentIndexes: { [key: string]: number } = {
    'En_cours': 0,
    'Planifier': 0,
    'Terminee': 0
  };
  
  // Pour la rotation
  private intervalSubscription: Subscription | null = null;

  constructor(
    private router: Router, 
    private marketingService: MarketingService
  ) {
    this.nomUtilisateur = localStorage.getItem('nomUtilisateur') || 'Utilisateur';
  }

  ngOnInit(): void {
    this.renderChart();
    this.loadCampagnesActives();
    this.loadAllCampagnes();
    
    // Démarrer le carrousel après le chargement des données
    this.startCarousel();
  }
  
  ngOnDestroy(): void {
    // Nettoyer la souscription à l'intervalle lors de la destruction du composant
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
  }

  loadCampagnesActives(): void {
    this.marketingService.getCampagnes().subscribe({
      next: (campagnes) => {
        this.activeCampagnesCount = campagnes.filter(
          campagne => campagne.statut === 'En_cours'
        ).length;
      },
      error: (err) => {
        console.error('Erreur de chargement des campagnes:', err);
        this.activeCampagnesCount = 0;
      }
    });
  }

  loadAllCampagnes(): void {
    this.marketingService.getCampagnes().subscribe({
      next: (campagnes) => {
        // Regrouper toutes les campagnes par statut
        this.groupCampagnesByStatus(campagnes);
        
        // Initialiser les campagnes affichées
        this.initializeDisplayedCampagnes();
      },
      error: (err) => console.error('Erreur chargement campagnes:', err)
    });
  }

  private groupCampagnesByStatus(campagnes: any[]): void {
    this.allCampagnes = campagnes.reduce((groups, campagne) => {
      const status = campagne.statut;
      if (!groups[status]) groups[status] = [];
      groups[status].push(campagne);
      return groups;
    }, {});
  }
  
  private initializeDisplayedCampagnes(): void {
    // Pour chaque statut, définir la première campagne à afficher
    Object.keys(this.displayedCampagnes).forEach(status => {
      if (this.allCampagnes[status] && this.allCampagnes[status].length > 0) {
        this.displayedCampagnes[status] = this.allCampagnes[status][0];
      }
    });
  }
  
  private startCarousel(): void {
    // Changer les campagnes toutes les 5 secondes
    this.intervalSubscription = interval(5000).subscribe(() => {
      this.rotateCampagnes();
    });
  }
  
  private rotateCampagnes(): void {
    // Pour chaque statut, passer à la campagne suivante
    Object.keys(this.displayedCampagnes).forEach(status => {
      if (this.allCampagnes[status] && this.allCampagnes[status].length > 1) {
        // Incrémenter l'index et boucler si nécessaire
        this.currentIndexes[status] = (this.currentIndexes[status] + 1) % this.allCampagnes[status].length;
        
        // Mettre à jour la campagne affichée
        this.displayedCampagnes[status] = this.allCampagnes[status][this.currentIndexes[status]];
      }
    });
  }
  
  // Fonction pour passer manuellement à la campagne suivante d'un statut spécifique
  nextCampaign(status: string): void {
    if (this.allCampagnes[status] && this.allCampagnes[status].length > 1) {
      this.currentIndexes[status] = (this.currentIndexes[status] + 1) % this.allCampagnes[status].length;
      this.displayedCampagnes[status] = this.allCampagnes[status][this.currentIndexes[status]];
    }
  }
  
  // Fonction pour passer manuellement à la campagne précédente d'un statut spécifique
  prevCampaign(status: string): void {
    if (this.allCampagnes[status] && this.allCampagnes[status].length > 1) {
      this.currentIndexes[status] = (this.currentIndexes[status] - 1 + this.allCampagnes[status].length) % this.allCampagnes[status].length;
      this.displayedCampagnes[status] = this.allCampagnes[status][this.currentIndexes[status]];
    }
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'En_cours': 'En cours',
      'Planifier': 'Planifiée',
      'Terminee': 'Terminée'
    };
    return labels[status] || status;
  }

  calculateProgress(campagne: any): number {
    const start = new Date(campagne.dateDebut).getTime();
    const end = new Date(campagne.dateFin).getTime();
    const now = Date.now();
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    return Math.round(((now - start) / (end - start)) * 100);
  }
  
  getCampaignCount(status: string): number {
    return this.allCampagnes[status]?.length || 0;
  }

  renderChart(): void {
    const ctx = document.getElementById('performanceChart') as HTMLCanvasElement;
    if (!ctx) return;
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
        datasets: [
          {
            label: 'Revenus (FCFA)',
            data: [12000, 19000, 3000, 5000, 2000, 3000],
            borderColor: '#ff6600',
            backgroundColor: 'rgba(255, 102, 0, 0.1)',
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          tooltip: {
            enabled: true,
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Mois',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Revenus (FCFA)',
            },
          },
        },
      },
    });
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/connexion']);
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}