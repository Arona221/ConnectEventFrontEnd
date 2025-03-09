import { Component, OnInit, ViewChild } from '@angular/core';
import { EvenementService } from '../../core/service/evenement.service';
import { EvenementDTO } from '../../core/model/EvenementDTO';
import { Page } from '../../core/model/Page';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Status } from '../../core/enumeration/Status'; // Importez l'enum Status
import { NotificationService } from '../../core/service/notification.service'; // Import NotificationService
import { Observable } from 'rxjs'; // Import Observable
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import { ChangeDetectorRef } from '@angular/core';
import { AfterViewInit } from '@angular/core';
import { NgZone } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';

@Component({
  selector: 'app-gerer-evenement',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RouterLinkActive,
    FullCalendarModule
  ],
  templateUrl: './gerer-evenement.component.html',
  styleUrls: ['./gerer-evenement.component.scss']
})
export class GererEvenementComponent implements OnInit {
  @ViewChild(FullCalendarComponent) calendar!: FullCalendarComponent;
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
  notificationCount$: Observable<number>; // Declare the property
   // Configuration du calendrier
   calendarOptions!: CalendarOptions;
   calendarEvents: EventInput[] = []; // Initialisez avec un tableau vide

  constructor(
    private router: Router,
    private evenementService: EvenementService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef ,
    private ngZone: NgZone
  ) {
    this.nomUtilisateur = localStorage.getItem('nomUtilisateur') || 'Utilisateur';
    this.notificationCount$ = this.notificationService.notificationsCount$; // Initialize it
  }

  ngOnInit(): void {
    this.loadEvenements();
    this.initCalendar();
  }

 // Modifiez la méthode loadEvenements() :
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

      // Créez un nouveau tableau pour calendarEvents
      this.calendarEvents = [...data.content.map(event => ({
        id: event.id_evenement.toString(),
        title: event.nom,
        start: event.date,
        extendedProps: {
          id: event.id_evenement,
          status: event.status,
          lieu: event.lieu
        },
        allDay: true
      }))];

      this.isLoading = false;
      this.cdr.detectChanges(); // Force la détection de changement
      
    },
    error: (err) => {
      this.errorMessage = 'Échec du chargement des événements. Veuillez réessayer.';
      this.isLoading = false;
      this.cdr.detectChanges(); // Force la détection de changement en cas d'erreur
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
  private initCalendar(): void {
    this.calendarOptions = {
      initialView: 'dayGridMonth',
      plugins: [
        dayGridPlugin,
        bootstrap5Plugin
      ],
      themeSystem: 'bootstrap5',
      locale: 'fr',
      headerToolbar: {
        left: 'prev,next',
        center: 'title',
        right: '' // Supprimez les boutons de vue ici, nous les avons ajoutés manuellement
      },
      height: 'auto',
      contentHeight: 'auto',
      aspectRatio: 1,
      dayMaxEventRows: 1, // Limite à 1 événement visible par jour
      moreLinkClick: 'day', // Cliquer sur "more" affiche la vue jour
      events: this.calendarEvents,
      eventDidMount: this.styleEvents.bind(this),
      datesSet: this.handleDateChange.bind(this),
      eventClick: this.handleEventClick.bind(this),
      // Options supplémentaires pour améliorer le rendu compact
      views: {
        dayGridMonth: {
          dayMaxEventRows: 1, // Pour la vue mois
          fixedWeekCount: false, // N'affiche que les semaines du mois actuel
          titleFormat: { month: 'long', year: 'numeric' }
        },
        dayGridWeek: {
          dayMaxEventRows: 2, // Pour la vue semaine
          titleFormat: { month: 'short', day: 'numeric', year: 'numeric' }
        },
        dayGridDay: {
          titleFormat: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
        }
      }
    };
  }
  private styleEvents(info: any): void {
    const event = info.event;
    const isPast = event.start < new Date();
    
    if (isPast) {
      info.el.classList.add('event-past');
      info.el.style.backgroundColor = '#f8f9fa';
      info.el.style.color = '#6c757d';
    } else {
      // Ajouter une classe basée sur le statut
      const statusClass = 'event-' + event.extendedProps.status.toLowerCase();
      info.el.classList.add(statusClass);
    }
    
    info.el.style.borderRadius = '2px';
    info.el.style.padding = '1px 3px';
    info.el.title = `${event.title} - ${event.extendedProps.lieu} - ${event.extendedProps.status}`;
  }

  private getStatusColor(status: string): string {
    const colors = {
      [Status.EN_ATTENTE]: '#ffc107',
      [Status.APPROUVE]: '#198754',
      [Status.ANNULE]: '#dc3545',
      [Status.TERMINER]: '#6c757d'
    };
    return colors[status as keyof typeof colors] || '#0d6efd';
  }

  private handleDateChange(dateInfo: any): void {
    if (!this.isLoading) { // Évite les appels multiples
      this.loadEvenements();
    }
  }
 private handleEventClick(clickInfo: any): void {
  this.ngZone.run(() => {
    this.voirDetails(clickInfo.event.extendedProps.id);
  });
}
  ngAfterViewInit(): void {
    this.cdr.detectChanges(); // Force une détection de changement après le rendu initial
  }
  switchCalendarView(viewName: string): void {
    if (this.calendar) {
      this.calendar.getApi().changeView(viewName);
    }
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/connexion']);
  }
}