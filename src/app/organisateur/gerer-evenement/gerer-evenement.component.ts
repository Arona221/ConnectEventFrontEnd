import { Component, OnInit } from '@angular/core';
import { EvenementService } from '../../core/service/evenement.service';
import { EvenementDTO } from '../../core/model/EvenementDTO';
import { Page } from '../../core/model/Page';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Status } from '../../core/enumeration/Status'; // Importez l'enum Status

@Component({
  selector: 'app-gerer-evenement',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './gerer-evenement.component.html',
  styleUrls: ['./gerer-evenement.component.scss']
})
export class GererEvenementComponent implements OnInit {
  nomUtilisateur: string | null = '';
  notificationsCount = 1;
  pageSize = 10;
  evenements: Page<EvenementDTO> = { content: [], totalPages: 0, totalElements: 0, number: 0, size: this.pageSize };
  currentPage = 0;
  searchTerm = '';
  selectedStatus = '';
  statuses = Object.values(Status); // Liste des statuts disponibles
  totalPages = 0;
  pages: number[] = [];
  isLoading = false;
  errorMessage = '';
  notifications: string[] = [];

  constructor(private router: Router, private evenementService: EvenementService) {
    this.nomUtilisateur = localStorage.getItem('nomUtilisateur') || 'Utilisateur';
  }

  ngOnInit(): void {
    this.loadEvenements();
  }

  loadEvenements(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const idOrganisateur = Number(localStorage.getItem('idUtilisateur'));
    this.evenementService.getEvenementsByOrganisateur(
      idOrganisateur, 
      this.currentPage, 
      this.pageSize, 
      this.searchTerm,
      this.selectedStatus ? Status[this.selectedStatus as keyof typeof Status] : undefined
  ).subscribe({
      next: (data) => {
        this.evenements = data;
        this.totalPages = data.totalPages;
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Échec du chargement des événements. Veuillez réessayer.';
        this.isLoading = false;
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadEvenements();
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadEvenements();
  }

  onStatusChange(): void {
    // Convertir le string en enum Status
    const statusEnum = this.selectedStatus ? Status[this.selectedStatus as keyof typeof Status] : null;
    
    this.currentPage = 0;
    this.loadEvenements();
}

  voirDetails(id: number): void {
    this.router.navigate(['/consulter', id]);
}

  editerEvenement(id: number): void {
    this.router.navigate(['/editer-evenement', id]);
  }

  supprimerEvenement(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      this.evenementService.deleteEvenement(id).subscribe({
        next: () => {
          this.addNotification('Événement supprimé avec succès !');
          this.loadEvenements();
        },
        error: () => {
          this.errorMessage = 'Échec de la suppression. Veuillez réessayer.';
        }
      });
    }
  }

  addNotification(message: string): void {
    this.notifications.push(message);
    setTimeout(() => this.removeNotification(message), 5000);
  }

  removeNotification(message: string): void {
    this.notifications = this.notifications.filter(m => m !== message);
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/connexion']);
  }
}