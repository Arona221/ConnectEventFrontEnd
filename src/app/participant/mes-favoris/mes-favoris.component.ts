import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { EvenementService } from '../../core/service/evenement.service';
import { ToastrService } from 'ngx-toastr';
import { Page } from '../../core/model/Page';
import { EvenementDTO } from '../../core/model/EvenementDTO';
import { animate, style, transition, trigger } from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-mes-favoris',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    PaginationComponent,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './mes-favoris.component.html',
  styleUrls: ['./mes-favoris.component.scss'],
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateX(20px)' }))
      ])
    ])
  ]
})
export class MesFavorisComponent implements OnInit {
  events: EvenementDTO[] = [];
  currentPage = 0;
  pageSize = 8;
  totalElements = 0;
  totalPages = 0;
  isLoading = true;
  isGridView = true;
  notificationsCount = 1;
  nomUtilisateur: string | null = '';

  constructor(
    private eventService: EvenementService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.nomUtilisateur = localStorage.getItem('nomUtilisateur') || 'Utilisateur';
  }

  ngOnInit() {
    this.loadFavorites();
    this.eventService.favoritesUpdated$.subscribe(() => {
      this.currentPage = 0;
      this.loadFavorites(true); // Forcer le rechargement
    });
    
  }

  loadFavorites(forceReload = false) {
    if (forceReload) {
      localStorage.removeItem('favoritesCache');
    }
    this.isLoading = true;
    const idUtilisateur = Number(localStorage.getItem('idUtilisateur'));
    
    const cache = localStorage.getItem('favoritesCache');
    const cacheData = cache ? JSON.parse(cache) : null;
    
    if (cacheData && Date.now() - cacheData.timestamp < 300000) {
      this.events = cacheData.data.content;
      this.totalElements = cacheData.data.totalElements;
      this.totalPages = Math.ceil(this.totalElements / this.pageSize);
      this.isLoading = false;
    } else {
      this.eventService.getFavoritesByUser(idUtilisateur, this.currentPage, this.pageSize).subscribe({
        next: (page) => {
          this.events = page.content;
          this.totalElements = page.totalElements;
          this.totalPages = Math.ceil(this.totalElements / this.pageSize);
          this.isLoading = false;
        },
        error: (err) => {
          this.toastr.error('Erreur lors du chargement des favoris');
          this.isLoading = false;
        }
      });
    }
  }

  async confirmDelete(eventId: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmation',
        message: 'Voulez-vous vraiment retirer cet événement de vos favoris ?'
      }
    });

    const result = await dialogRef.afterClosed().toPromise();
    if (result) {
      this.removeFromFavorites(eventId);
    }
  }

  removeFromFavorites(eventId: number) {
    const idUtilisateur = Number(localStorage.getItem('idUtilisateur'));
    
    this.eventService.removeFromFavorites(idUtilisateur, eventId).subscribe({
      next: () => {
        this.events = this.events.filter(e => e.id_evenement !== eventId);
        this.totalElements--;
        this.totalPages = Math.ceil(this.totalElements / this.pageSize);
        this.toastr.success('Événement retiré des favoris', '', {
          positionClass: 'toast-bottom-right',
          progressBar: true,
          timeOut: 2000
        });
        localStorage.removeItem('favoritesCache');
      },
      error: (err) => {
        this.toastr.error('Erreur lors de la suppression', '', {
          positionClass: 'toast-bottom-right',
          progressBar: true
        });
      }
    });
  }

  onPageChange(newPage: number) {
    this.currentPage = newPage;
    this.loadFavorites();
  }

  getEventImageUrl(event: EvenementDTO): string {
    return this.eventService.getImageUrl(event.imagePath); 
  }

  toggleView() {
    this.isGridView = !this.isGridView;
    localStorage.setItem('favoritesViewMode', this.isGridView ? 'grid' : 'list');
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/connexion']);
  }
}