import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MarketingService } from '../../core/service/marketing.service';
import { EvenementDTO } from '../../core/model/EvenementDTO';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mes-campagne',
  imports: [RouterLinkActive, RouterLink, FormsModule, CommonModule],
  templateUrl: './mes-campagne.component.html',
  styleUrl: './mes-campagne.component.scss'
})
export class MesCampagneComponent implements OnInit {
  isMenuOpen = false;
  nomUtilisateur: string | null = '';
  events: EvenementDTO[] = [];
  filters = {
    categorie: '',
    lieu: '',
    date: '',
  };
  pagination = {
    page: 0,
    size: 9,
    sortBy: 'date',
    sortDirection: 'asc',
    totalElements: 0,
  };
  

  constructor(private router: Router,private marketingService: MarketingService) {
    this.nomUtilisateur = localStorage.getItem('nomUtilisateur');
  }
  ngOnInit(): void {
    this.loadEvents();
  }
  loadEvents(): void {
    this.marketingService
      .getApprovedEvents(
        this.filters.categorie,
        this.filters.lieu,
        this.filters.date,
        this.pagination.page,
        this.pagination.size,
        this.pagination.sortBy,
        this.pagination.sortDirection
      )
      .subscribe((response: any) => {
        this.events = response.content;
        this.pagination.totalElements = response.totalElements;
      });
  }
  applyFilters(): void {
    this.pagination.page = 0; // Réinitialiser la pagination lors de l'application des filtres
    this.loadEvents();
  }

  onPageChange(page: number): void {
    this.pagination.page = page;
    this.loadEvents();
  }

  onSortChange(sortBy: string, sortDirection: string): void {
    this.pagination.sortBy = sortBy;
    this.pagination.sortDirection = sortDirection;
    this.loadEvents();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
  getPages(): number[] {
    const totalPages = Math.ceil(this.pagination.totalElements / this.pagination.size);
    return Array.from({ length: totalPages }, (_, i) => i);
  }
  promouvoirEvent(eventId: number): void {
    this.router.navigate(['/campagnes-create'], { queryParams: { eventId } });
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/connexion']);
  }
}
