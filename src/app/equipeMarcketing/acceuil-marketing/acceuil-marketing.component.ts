import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js/auto';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-acceuil-marketing',
  imports: [ RouterLinkActive,RouterLink],
  templateUrl: './acceuil-marketing.component.html',
  styleUrls: ['./acceuil-marketing.component.scss'],
})
export class AcceuilMarketingComponent implements OnInit {
  isMenuOpen = false;
  nomUtilisateur: string | null = '';
  

  constructor(private router: Router) {
    this.nomUtilisateur = localStorage.getItem('nomUtilisateur') || 'Utilisateur';
  }
  

  ngOnInit(): void {
    this.renderChart();
  }

  renderChart(): void {
    const ctx = document.getElementById('performanceChart') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'line', // Type de graphique (ligne)
      data: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'], // Étiquettes de l'axe X
        datasets: [
          {
            label: 'Revenus (FCFA)', // Légende du dataset
            data: [12000, 19000, 3000, 5000, 2000, 3000], // Données
            borderColor: '#ff6600', // Couleur de la ligne

            backgroundColor: 'rgba(255, 102, 0, 0.1)', // Couleur de fond
            fill: true, // Remplir sous la ligne
            tension: 0.4, // Courbure de la ligne
          },
        ],
      },
      options: {
        responsive: true, // Graphique responsive
        plugins: {
          legend: {
            display: true, // Afficher la légende
            position: 'top', // Position de la légende
          },
          tooltip: {
            enabled: true, // Activer les infobulles
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Mois', // Titre de l'axe X
            },
          },
          y: {
            title: {
              display: true,
              text: 'Revenus (FCFA)', // Titre de l'axe Y
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