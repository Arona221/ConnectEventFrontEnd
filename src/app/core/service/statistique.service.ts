import { Injectable, Inject, forwardRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { SalesMetrics, ExportOptions, FactureResponse, PaiementResponse } from '../model/statistique.model';
import { ExportService } from './export.service';

@Injectable({
  providedIn: 'root',
})
export class StatistiqueService {
  private apiUrl = `${environment.apiUrl}/analytics`;

  constructor(
    private http: HttpClient,
    // Utiliser forwardRef pour briser la dépendance circulaire
    @Inject(forwardRef(() => ExportService)) private exportService: ExportService
  ) {}

  /**
   * Récupère les métriques de vente pour un organisateur spécifique.
   * @param organisateurId - L'ID de l'organisateur.
   * @returns Un observable des métriques de vente.
   */
  getOrganizerMetrics(organisateurId: number): Observable<SalesMetrics[]> {
    return this.http.get<SalesMetrics[]>(`${this.apiUrl}/organisateur/${organisateurId}`).pipe(
      map((data) =>
        data.map((item) => ({
          ...item,
          lastUpdated: new Date(item.lastUpdated),
          eventName: item.eventName || 'Événement sans nom', // Fallback pour les noms manquants
        }))
      )
    );
  }

  /**
   * Récupère les détails des métriques pour un événement spécifique.
   * @param eventId - L'ID de l'événement.
   * @returns Un observable des métriques de l'événement.
   */
  getEventMetrics(eventId: number): Observable<SalesMetrics> {
    return this.http.get<any>(`${this.apiUrl}/event/${eventId}/details`).pipe(
      map((data) => ({
        ...data,
        lastUpdated: new Date(data.lastUpdated),
        ticketsByType: data.ticketsByType.map((ticket: any) => ({
          type: ticket.type,
          quantity: ticket.quantity,
          revenue: ticket.revenue,
        })),
      }))
    );
  }

  // Méthodes supplémentaires...

  /**
   * Exporte les données statistiques dans un fichier PDF ou Excel
   */
  exportData(data: SalesMetrics[], options: ExportOptions) {
    const exportData = options.includeDailyData ? data : data.map(item => ({
      ...item,
      eventId: item.eventId,
      eventName: item.eventName,
      totalRevenue: item.totalRevenue,
      totalTicketsSold: item.totalTicketsSold,
      lastUpdated: item.lastUpdated,
      ticketsByType: item.ticketsByType,
      id: item.id,
      organisateurId: item.organisateurId
    }));

    if (options.format === 'pdf') {
      exportData.forEach(event => 
        this.exportService.exportEventToPDF(event, `${options.fileName}_${event.eventId}.pdf`)
      );
    } else if (options.format === 'excel') {
      exportData.forEach(event => 
        this.exportService.exportEventToExcel(event, `${options.fileName}_${event.eventId}.xlsx`)
      );
    }
  }
}
