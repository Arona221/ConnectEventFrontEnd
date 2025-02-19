// ressources.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator, MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { RessourceService } from '../../core/service/ressource.service';
import { Router, RouterModule } from '@angular/router';
import { RessourceDTO, LieuDTO, TransportDTO, EquipementDTO } from '../../core/model/RessourceDTO';
import { Page } from '../../core/model/page.model';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule } from '@angular/material/paginator';
import { environment } from '../../../environments/environment';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { FrenchPaginatorIntl } from './french-paginator-intl';
import { ToastrService } from 'ngx-toastr';
import { NotificationService } from '../../core/service/notification.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-trouver-ressources',
  imports: [ 
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    MatPaginatorModule
  ],
  providers: [
    { provide: MatPaginatorIntl, useClass: FrenchPaginatorIntl }
  ],
  templateUrl: './trouver-ressources.component.html',
  styleUrls: ['./trouver-ressources.component.scss']
})
export class TrouverRessourcesComponent implements OnInit {
  ressources: Page<RessourceDTO> = { 
    content: [], 
    totalElements: 0, 
    number: 0, 
    size: 10, 
    last: false, 
    first: true, 
    empty: true 
  };
  searchForm: FormGroup;
  reservationForm: FormGroup;
  selectedRessource: RessourceDTO | null = null;
  showReservationForm = false;
  reservationType: 'daily' | 'multi-day' | null = null;
  totalPrice = 0;
  viewMode: 'grid' | 'list' = 'grid';
  autoRefresh = true;
  loading = false;
  notificationsCount = 0;
  nomUtilisateur: string = localStorage.getItem('nomUtilisateur') || 'Utilisateur';
  notificationCount$: Observable<number>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private ressourceService: RessourceService,
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private notificationService: NotificationService
  ) {
    this.searchForm = this.fb.group({
      searchTerm: [''],
      type: [''],
      prixMin: [null],
      prixMax: [null]
    });

    this.reservationForm = this.fb.group({
      startDate: [null, Validators.required],
      endDate: [null],
      startTime: [null],
      endTime: [null]
    });

    this.notificationCount$ = this.notificationService.notificationsCount$;
  }

  ngOnInit(): void {
    this.loadRessources();
    this.setupAutoRefresh();
    this.setupPriceCalculator();
  }
  private setupAutoRefresh(): void {
    this.searchForm.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      if (this.autoRefresh) this.loadRessources();
    });
  }
  private setupPriceCalculator(): void {
    this.reservationForm.valueChanges.subscribe(() => {
      if (this.reservationForm.valid) {
        this.calculatePrice();
      }
    });
  }

  loadRessources(page = 0, size = 9): void {
    this.loading = true;
    const filters = this.searchForm.value;
    
    this.ressourceService.searchRessources(filters, page, size).subscribe({
      next: (data) => {
        this.ressources = data;
        this.paginator.pageIndex = data.number;
        this.paginator.length = data.totalElements;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading resources:', err);
        this.loading = false;
      }
    });
  }
  getImageUrl(imagePath: string): string {
    if (!imagePath) {
        return 'assets/images/default-resource.jpg';
    }

    // Nettoyer le chemin : supprimer les barres en début/fin et remplacer les doubles barres internes
    const cleanPath = imagePath
        .replace(/^\/+/g, '')         // Enlève les barres au début
        .replace(/\/+$/g, '')         // Enlève les barres à la fin
        .replace(/\/+/g, '/');        // Remplace les doubles barres internes par une seule

    // Nettoyer l'URL de base (au cas où elle contiendrait une barre finale)
    const baseUrl = environment.imageBaseUrl.replace(/\/+$/g, '');

    return cleanPath 
        ? `${baseUrl}/${cleanPath}` 
        : 'assets/images/default-resource.jpg';
}

  handleImageError(event: any): void {
    event.target.src = 'assets/images/default-resource.jpg';
  }

  onPageChange(event: PageEvent): void {
    this.loadRessources(event.pageIndex, event.pageSize);
  }

  onSearch(): void {
    this.loadRessources();
  }

  showReservation(resource: RessourceDTO, type: 'daily' | 'multi-day'): void {
    this.selectedRessource = resource;
    this.reservationType = type;
    this.showReservationForm = true;
    
    this.reservationForm.reset();
    if (type === 'daily') {
      this.reservationForm.get('endDate')?.clearValidators();
      this.reservationForm.get('startTime')?.setValidators([Validators.required]);
      this.reservationForm.get('endTime')?.setValidators([Validators.required]);
    } else {
      this.reservationForm.get('startTime')?.clearValidators();
      this.reservationForm.get('endTime')?.clearValidators();
      this.reservationForm.get('endDate')?.setValidators([Validators.required]);
    }
    this.reservationForm.updateValueAndValidity();
  }

  calculatePrice(): void {
    if (!this.selectedRessource || !this.reservationForm.valid) return;

    try {
      const { startDate, endDate, startTime, endTime } = this.reservationForm.value;
      
      if (this.reservationType === 'daily') {
        const start = new Date(`${startDate}T${startTime}`);
        const end = new Date(`${startDate}T${endTime}`);
        this.totalPrice = this.calculateHours(start, end);
      } else {
        const start = new Date(startDate);
        const end = new Date(endDate);
        this.totalPrice = this.calculateDays(start, end);
      }
    } catch (error) {
      console.error('Erreur de calcul:', error);
      this.totalPrice = 0;
    }
  }
  private calculateHours(start: Date, end: Date): number {
    const diff = end.getTime() - start.getTime();
    const hours = Math.ceil(diff / (1000 * 60 * 60));
    return hours * this.selectedRessource!.prix;
  }

  private calculateDays(start: Date, end: Date): number {
    const diff = end.getTime() - start.getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24)) + 1;
    return days * 24 * this.selectedRessource!.prix;
  }
  submitReservation(): void {
    if (this.reservationForm.valid && this.selectedRessource) {
      const idOrganisateur = Number(localStorage.getItem('idUtilisateur'));
      const idRessource = this.selectedRessource.id;

      const reservationData = {
        ...this.reservationForm.value,
        totalPrice: this.totalPrice
      };

      this.ressourceService.reserverRessource(idOrganisateur, idRessource, reservationData).subscribe({
        next: (response) => {
          console.log('Réservation réussie:', response);
          this.showReservationForm = false;
          this.loadRessources(); // Recharger les ressources
          this.toastr.success('Réservation effectuée avec succès !', 'Succès', {
            timeOut: 5000, // Durée d'affichage de 5 secondes
            positionClass: 'toast--top-center', // Position en bas au centre
            progressBar: true, // Afficher une barre de progression
            closeButton: true, // Afficher un bouton de fermeture
          }); // Toast de succès
        },
        error: (err) => {
          console.error('Erreur lors de la réservation:', err);
          this.toastr.error('Erreur lors de la réservation : ' + err.error.message, 'Erreur'); // Toast d'erreur
        }
      });
    }
  }

  isLieu(ressource: RessourceDTO): ressource is LieuDTO {
    return ressource.type === 'LIEU';
  }

  isTransport(ressource: RessourceDTO): ressource is TransportDTO {
    return ressource.type === 'TRANSPORT';
  }

  isEquipement(ressource: RessourceDTO): ressource is EquipementDTO {
    return ressource.type === 'EQUIPEMENT';
  }
  logout(): void {
    localStorage.clear();
    this.router.navigate(['/connexion']);
  }

  // Dans votre composant
getPageNumbers(): number[] {
  const totalPages = Math.ceil(this.ressources.totalElements / this.ressources.size);
  return Array.from({ length: totalPages }, (_, i) => i + 1);
}

previousPage(): void {
  if (!this.ressources.first) {
    this.loadRessources(this.ressources.number - 1);
  }
}

nextPage(): void {
  if (!this.ressources.last) {
    this.loadRessources(this.ressources.number + 1);
  }
}

goToPage(pageIndex: number): void {
  this.loadRessources(pageIndex);
}
getTotalPages(): number {
  return Math.ceil(this.ressources.totalElements / this.ressources.size);
}
}


