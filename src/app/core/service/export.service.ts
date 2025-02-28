import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { SalesMetrics } from '../model/statistique.model';


@Injectable({
  providedIn: 'root'
})
export class ExportService {
  

  exportEventToPDF(eventData: SalesMetrics, fileName: string = 'rapport-evenement.pdf') {
    const documentDefinition = {
      content: [
        { text: `Rapport de l'événement: ${eventData.eventName}`, style: 'header' },
        this.generateEventDetails(eventData),
        this.generateTicketsTable(eventData.ticketsByType || []),
        { text: `Généré le : ${new Date().toLocaleDateString()}`, style: 'footer' }
      ],
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
        subheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
        footer: { fontSize: 10, italics: true, alignment: 'right' },
        tableHeader: { bold: true, fontSize: 12, color: 'black', fillColor: '#f5f5f5' }
      }
    };

    
  }
  exportEventToExcel(event: SalesMetrics, fileName: string): void {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([event]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Event Data');
    XLSX.writeFile(workbook, fileName);
  }

  private generateEventDetails(eventData: any) {
    return [
      { text: 'Détails généraux', style: 'subheader' },
      {
        table: {
          widths: ['*', '*'],
          body: [
            ['Revenu total', `${eventData.totalRevenue} FCFA`],
            ['Billets vendus', eventData.totalTicketsSold],
            ['Dernière mise à jour', new Date(eventData.lastUpdated).toLocaleDateString()]
          ]
        }
      }
    ];
  }

  private generateTicketsTable(tickets: any[]) {
    return [
      { text: 'Répartition des tickets', style: 'subheader' },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*', '*'],
          body: [
            ['Type', 'Quantité', 'Revenu'],
            ...tickets.map(t => [t.type, t.quantity, `${t.revenue} FCFA`])
          ]
        }
      }
    ];
  }
}