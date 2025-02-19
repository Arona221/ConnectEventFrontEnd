import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { EvenementDTO } from '../../core/model/EvenementDTO';
import { Categorie } from '../../core/enumeration/Categorie';
import { EvenementService } from '../../core/service/evenement.service';
import { ToastrService } from 'ngx-toastr';
import { PaginationComponent } from '../pagination/pagination.component';
import { ReactiveFormsModule } from '@angular/forms';
import { BilletDTO } from '../../core/model/BilletDTO';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-eveenement',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    RouterLink,
    RouterLinkActive,
    PaginationComponent,
    ReactiveFormsModule
  ],
  templateUrl: './eveenement.component.html', 
  styleUrls: ['./eveenement.component.scss']
})
export class EveenementComponent implements OnInit{
  defaultImagePath = 'assets/images/default-event.jpg';
  events: EvenementDTO[] = [];
  currentPage = 0;
  pageSize = 8;
  totalElements = 0;
  totalPages = 0;
  isLoading = true;
  searchForm: FormGroup;
  categories = Object.values(Categorie);
  notificationsCount = 1;
  nomUtilisateur: string | null = '';
  public environment = environment;
  favoriteStatusMap: { [key: number]: boolean } = {};

  constructor(private router: Router, private eventService: EvenementService,
    private toastr: ToastrService,  
    private fb: FormBuilder) {
    this.nomUtilisateur = localStorage.getItem('nomUtilisateur') || 'Utilisateur';
    this.searchForm = this.fb.group({
      search: [''],
      categorie: [''],
      date: [''],
      lieu: ['']
    });
  }
  ngOnInit(): void {
    this.loadEvents();
    this.setupSearch();
  }
  setupSearch(): void {
    this.searchForm.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.currentPage = 0;
        this.loadEvents();
      });
  }

  loadEvents(): void {
    this.isLoading = true;
    const formValue = this.searchForm.value;

    this.eventService.getApprovedEvents(
      this.currentPage,
      this.pageSize,
      formValue.search,
      formValue.categorie,
      formValue.date,
      formValue.lieu
    ).subscribe({
      next: (page) => {
        this.events = page.content;
        this.totalElements = page.totalElements;
        this.totalPages = Math.ceil(this.totalElements / this.pageSize);
        
        // Charger le statut des favoris pour chaque événement
        this.events.forEach(event => {
          this.eventService.getFavoriteStatus(event.id_evenement).subscribe({
            next: (status) => {
              this.favoriteStatusMap[event.id_evenement] = status;
            },
            error: (err) => console.error(err)
          });
        });
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Erreur lors du chargement des événements');
        this.isLoading = false;
      }
    });
  }


  logout() {
    localStorage.clear();
    this.router.navigate(['/connexion']);
  }

  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.loadEvents();
  }

  getMinPrice(billets: BilletDTO[]): number {
    if (!billets || billets.length === 0) {
      return 0; // Return 0 or a default value if there are no billets
    }
    return Math.min(...billets.map(billet => billet.prix)); // Assuming 'prix' is a property of BilletDTO
  }

  toggleFavorite(eventId: number): void {
    const idUtilisateur = Number(localStorage.getItem('idUtilisateur'));
    
    if (this.favoriteStatusMap[eventId]) {
      this.eventService.removeFromFavorites(idUtilisateur, eventId).subscribe({
        next: () => {
          this.favoriteStatusMap[eventId] = false;
          this.toastr.success('Événement retiré des favoris');
          localStorage.removeItem('favoritesCache');
        },
        error: (err) => this.toastr.error('Erreur lors de la suppression des favoris')
      });
    } else {
      this.eventService.addToFavorites(idUtilisateur, eventId).subscribe({
        next: () => {
          this.favoriteStatusMap[eventId] = true;
          this.toastr.success('Événement ajouté aux favoris');
        },
        error: (err) => this.toastr.error('Erreur lors de l\'ajout aux favoris')
      });
    }
  }

  getEventImageUrl(event: EvenementDTO): string {
    console.log('Valeurs reçues pour imageUrl:', event.imageUrl); // Debug
    
    if (event.imageUrl) {
      return `http://localhost:8081/api/ConnectEvent/uploads/${event.imageUrl}`;
    }
  
    return 'assets/images/addimage.png'; // Image par défaut si `imageUrl` est absent
  }
  
  

  onImageError(event: any): void {
    event.target.src = this.defaultImagePath;
  }
  
  
}