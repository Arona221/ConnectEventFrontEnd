import { Component, Input, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { NotificationService } from '../../core/service/notification.service';
import { StatistiqueService } from '../../core/service/statistique.service';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';

interface TicketSales {
  type: string;
  quantity: number;
  revenue: number;
}

interface SalesMetrics {
  id: number;
  eventId: number;
  organisateurId: number;
  eventName: string;
  totalRevenue: number;
  totalTicketsSold: number;
  lastUpdated: Date;
  ticketsByType?: TicketSales[];
}

@Component({
  selector: 'app-event-statistics',
  templateUrl: './event-statistics.component.html',
  styleUrls: ['./event-statistics.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, NgxChartsModule],
  providers: [StatistiqueService]
})
export class EventStatisticsComponent implements OnInit {
  notificationCount$: Observable<number>;
  nomUtilisateur: string | null = '';

  @Input() eventId!: number;
  metrics: SalesMetrics | null = null; // Initialiser à null
  isLoading = true;
  hasError = false; // Ajouter un indicateur d'erreur

  // Données pour le diagramme circulaire
  pieChartData: { name: string; value: number }[] = [];
  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'],
  };

  constructor(
    private notificationService: NotificationService,
    private statistiqueService: StatistiqueService,
    @Inject(ActivatedRoute) private route: ActivatedRoute
  ) {
    this.notificationCount$ = this.notificationService.notificationsCount$;
    this.nomUtilisateur = localStorage.getItem('nomUtilisateur');
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.eventId = params['eventId'];
      this.loadEventMetrics();
    });
  }

  private loadEventMetrics() {
    this.statistiqueService.getEventMetrics(this.eventId).subscribe({
      next: (metrics: SalesMetrics) => {
        this.metrics = metrics;
        this.preparePieChartData(metrics.ticketsByType || []);
        this.isLoading = false;
      },
      error: (err: Error) => {
        console.error('Erreur de chargement des métriques', err);
        this.isLoading = false;
        this.hasError = true; // Activer l'indicateur d'erreur
      },
    });
  }

  private preparePieChartData(tickets: TicketSales[]) {
    this.pieChartData = tickets.map((ticket) => ({
      name: ticket.type, // Utiliser ticket.type au lieu de ticket.ticketType
      value: ticket.quantity,
    }));
  }

  exportPDF() {
    if (this.metrics) {
      this.statistiqueService.exportData(
        [this.metrics], 
        { 
          format: 'pdf', 
          fileName: `rapport-${this.metrics.eventName}`, 
          includeDailyData: true 
        }
      );
    }
  }

  exportExcel() {
    if (this.metrics) {
      this.statistiqueService.exportData(
        [this.metrics], 
        { 
          format: 'excel', 
          fileName: `rapport-${this.metrics.eventName}`, 
          includeDailyData: true 
        }
      );
    }
  }
  logout(): void {
    localStorage.clear();
  }
}