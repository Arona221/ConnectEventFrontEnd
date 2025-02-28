import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { NotificationService } from '../../core/service/notification.service';
import { StatistiqueService } from '../../core/service/statistique.service';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule],
  providers: [StatistiqueService]
})
export class EventListComponent  implements OnInit {
  notificationCount$: Observable<number>;
  nomUtilisateur: string | null = '';
  events: any[] = [];
  organisateurId: number;

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private statistiqueService: StatistiqueService
  ) {
    this.notificationCount$ = this.notificationService.notificationsCount$;
    this.nomUtilisateur = localStorage.getItem('nomUtilisateur');
    this.organisateurId = Number(localStorage.getItem('idUtilisateur'));
  }
  ngOnInit(): void {
    
    this.statistiqueService.getOrganizerMetrics(this.organisateurId)
      .subscribe({
        next: (data) => this.events = data,
        error: (err) => console.error(err)
      });
  }

  logout(): void {
    localStorage.clear();
  }
}
