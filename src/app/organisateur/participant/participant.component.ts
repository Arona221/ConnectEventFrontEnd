import { Component, OnInit } from '@angular/core';
import { BilletService } from '../../core/service/billet.service';
import { NotificationService } from '../../core/service/notification.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-participant',
  templateUrl: './participant.component.html',
  styleUrls: ['./participant.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class ParticipantComponent implements OnInit {
  events: any[] = [];
  participants: any[] = [];
  ticketTypes: string[] = [];
  selectedEventName = '';
  nomUtilisateur = '';
  notificationCount$: Observable<number>;

  // Pagination
  currentPage = 1;
  itemsPerPage = 5;
  totalItems = 0;

  constructor(
    private billetService: BilletService,
    private notificationService: NotificationService,
    private modalService: NgbModal,
    private router: Router
  ) {
    this.nomUtilisateur = localStorage.getItem('nomUtilisateur') || 'Utilisateur';
    this.notificationCount$ = this.notificationService.notificationsCount$;
  }

  ngOnInit(): void {
    this.loadOrganizerEvents();
  }

  loadOrganizerEvents(): void {
    const organizerId = Number(localStorage.getItem('idUtilisateur'));
    this.billetService.getOrganizerEvents(organizerId).subscribe({
      next: (events) => {
        this.events = events;
        this.totalItems = events.length;
      },
      error: (err) => console.error(err)
    });
  }

  get paginatedEvents(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.events.slice(startIndex, startIndex + this.itemsPerPage);
  }

  totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  getPages(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages(); i++) {
      pages.push(i);
    }
    return pages;
  }

  openDetailsModal(content: any, event: any): void {
    this.selectedEventName = event.eventName;
    this.billetService.getEventParticipantsDetails(event.eventId).subscribe({
      next: (participants) => {
        this.participants = participants;
        this.ticketTypes = this.getUniqueTicketTypes();
        this.modalService.open(content, { size: 'xl' });
      },
      error: (err) => console.error(err)
    });
  }

  private getUniqueTicketTypes(): string[] {
    const types = new Set<string>();
    this.participants.forEach(p => {
      Object.keys(p.tickets).forEach(t => types.add(t));
    });
    return Array.from(types).sort();
  }

  getTotalTickets(participant: any): number {
    return Object.values(participant.tickets).reduce((acc: number, val: any) => acc + val, 0);
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/connexion']);
  }
}