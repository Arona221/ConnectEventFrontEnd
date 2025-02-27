import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ExportService } from './export.service';
import { environment } from '../../../environments/environment';
import { SalesMetrics, ExportOptions } from '../model/statistique.model';

@Injectable({
  providedIn: 'root',
})
export class StatistiqueService {
  private apiUrl = `${environment.apiUrl}/analytics`;

  constructor(private http: HttpClient, private exportService: ExportService) {}

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

  getEventMetrics(eventId: number): Observable<SalesMetrics> {
    return this.http.get<SalesMetrics>(`${this.apiUrl}/event/${eventId}/details`).pipe(
      map((data) => ({
        ...data,
        lastUpdated: new Date(data.lastUpdated),
      }))
    );
  }

  exportData(data: SalesMetrics[], options: ExportOptions) {
    const exportData = options.includeDailyData
      ? data
      : data.map((item) => ({
          eventName: item.eventName,
          totalRevenue: item.totalRevenue,
          totalTicketsSold: item.totalTicketsSold,
          lastUpdated: item.lastUpdated,
        }));

    if (options.format === 'pdf') {
      this.exportService.exportToPDF(exportData, options.fileName);
    } else if (options.format === 'excel') {
      this.exportService.exportToExcel(exportData, options.fileName);
    }
  }

  updateDateRange(startDate: Date, endDate: Date): void {
    console.log('Date range updated:', startDate, endDate);
  }
}