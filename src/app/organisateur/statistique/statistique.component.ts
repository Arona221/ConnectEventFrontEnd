import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { StatistiqueService } from '../../core/service/statistique.service';
import { SalesMetrics, ExportOptions } from '../../core/model/statistique.model';
import { NotificationService } from '../../core/service/notification.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';
import { WebSocketService } from '../../core/service/socket.service';

interface BarChartData {
  name: string;
  value: number;
}

interface Sale {
  id: number;
  timestamp: Date;
  quantity: number;
  eventName: string;
  amount: number;
}

@Component({
  selector: 'app-statistique',
  templateUrl: './statistique.component.html',
  styleUrls: ['./statistique.component.scss'],
  standalone: true,
  imports: [CommonModule, NgxChartsModule,RouterLink,RouterLinkActive],
  providers: [WebSocketService],
})
export class StatistiqueComponent implements OnInit, OnDestroy {
  
  notificationsCount: number = 0;
  nomUtilisateur: string | null = '';
  notificationCount$: Observable<number>;
  metrics: SalesMetrics[] = [];
  realTimeSales: Sale[] = [];
  private subscriptions = new Subscription();
  totalRevenue: number = 0;
  totalTickets: number = 0;
  private webSocketSubscription!: Subscription;

  barChart = {
    data: [] as BarChartData[],
    showXAxis: true,
    showYAxis: true,
    gradient: false,
    xAxisLabel: 'Événements',
    yAxisLabel: 'Revenu (FCFA)',
    colorScheme: {
      name: 'custom',
      selectable: true,
      group: ScaleType.Ordinal,
      domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
    } as Color,
    animations: true,
    showDataLabel: true,
    roundDomains: true,
    showGridLines: true
  };

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private statistiqueService: StatistiqueService,
    private webSocketService: WebSocketService
  ) {
    this.notificationCount$ = this.notificationService.notificationsCount$;
  }

  ngOnInit(): void {
    console.log('Initialisation du composant');
    this.loadNotificationsCount();
    this.nomUtilisateur = localStorage.getItem('nomUtilisateur');
    this.loadData();
    
    this.webSocketSubscription = this.webSocketService.connect().subscribe({
      next: (update: any) => {
        this.realTimeSales = [this.mapToSale(update), ...this.realTimeSales].slice(0, 10);
      },
      error: (err) => console.error('Erreur WebSocket :', err),
    });
  }

  private mapToSale(update: any): Sale {
    return {
      id: update.eventId,
      timestamp: new Date(update.timestamp),
      quantity: update.quantity,
      eventName: update.eventName,
      amount: update.amount,
    };
  }

  trackBySaleId(index: number, sale: Sale): number {
    return sale.id;
  }

  private loadData() {
    const userId = Number(localStorage.getItem('idUtilisateur'));
    console.log('Chargement des données pour utilisateur:', userId);
    
    this.subscriptions.add(
      this.statistiqueService.getOrganizerMetrics(userId).subscribe({
        next: (metrics) => {
          console.log('Données reçues:', metrics);
          this.metrics = metrics;
          this.prepareChartData();
          this.calculateTotals();
          this.forceChartRefresh();
        },
        error: (err) => console.error('Erreur de chargement', err),
      })
    );
  }

  private forceChartRefresh() {
    const temp = [...this.barChart.data];
    this.barChart.data = [];
    setTimeout(() => this.barChart.data = temp, 100);
  }

  private calculateTotals() {
    this.totalRevenue = this.metrics.reduce((sum, m) => sum + (m.totalRevenue || 0), 0);
    this.totalTickets = this.metrics.reduce((sum, m) => sum + (m.totalTicketsSold || 0), 0);
    console.log('Totaux calculés - Revenue:', this.totalRevenue, 'Tickets:', this.totalTickets);
  }

  private prepareChartData() {
    console.log('Préparation des données:', this.metrics);
    this.barChart.data = this.metrics.map((m) => ({
      name: m.eventName || 'Événement sans nom',
      value: m.totalRevenue || 0
    }));
    console.log('Données du graphique:', this.barChart.data);
  }

  exportPDF() {
    const options: ExportOptions = {
      format: 'pdf',
      fileName: 'rapport-statistiques.pdf',
      includeDailyData: false,
    };
    this.statistiqueService.exportData(this.metrics, options);
  }

  exportExcel() {
    const options: ExportOptions = {
      format: 'excel',
      fileName: 'rapport-statistiques.xlsx',
      includeDailyData: true,
    };
    this.statistiqueService.exportData(this.metrics, options);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    if (this.webSocketSubscription) {
      this.webSocketSubscription.unsubscribe();
    }
  }

  loadNotificationsCount(): void {
    this.notificationService.notificationsCount$.subscribe((count) => {
      this.notificationsCount = count;
    });
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/connexion']);
  }
}