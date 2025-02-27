import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

// Import pdfMake differently
declare const pdfMake: any;

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  /**
   * Exporte les données au format PDF
   * @param data Données à exporter
   * @param fileName Nom du fichier PDF (par défaut : 'statistiques.pdf')
   */
  exportToPDF(data: any[], fileName: string = 'statistiques.pdf') {
    const documentDefinition = {
      content: [
        { text: 'Rapport des Statistiques', style: 'header' },
        this.generateTable(data),
        { text: `Généré le : ${new Date().toLocaleDateString()}`, style: 'footer' },
      ],
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
        footer: { fontSize: 10, italics: true, alignment: 'right' },
        tableHeader: { bold: true, fontSize: 12, color: 'black' },
      },
    };

    pdfMake.createPdf(documentDefinition).download(fileName);
  }

  /**
   * Exporte les données au format Excel
   * @param data Données à exporter
   * @param fileName Nom du fichier Excel (par défaut : 'statistiques.xlsx')
   */
  exportToExcel(data: any[], fileName: string = 'statistiques.xlsx') {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Statistiques');
    XLSX.writeFile(workbook, fileName);
  }

  /**
   * Génère une table pour le PDF
   * @param data Données à afficher dans la table
   * @returns Structure de la table pour PDFMake
   */
  private generateTable(data: any[]) {
    return {
      table: {
        headerRows: 1,
        widths: ['*', '*', '*', '*'],
        body: [
          ['Événement', 'Revenu Total', 'Billets Vendus', 'Date'],
          ...data.map((item) => [
            item.eventName,
            `${item.totalRevenue} FCFA`,
            item.totalTicketsSold,
            new Date(item.lastUpdated).toISOString().split('T')[0],
          ]),
        ],
      },
    };
  }
}