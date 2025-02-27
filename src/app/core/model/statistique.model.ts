export interface SalesMetrics {
    id: number;
    eventId: number;
    eventName: string;
    organisateurId: number;
    totalRevenue: number;
    totalTicketsSold: number;
    lastUpdated: Date;
    dailyData?: { 
      date: string; 
      totalSales: number;
      hourlyBreakdown?: { // Ajout de données horaires
        hour: string;
        sales: number;
      }[] 
    }[];
  }
  
  export interface DailySalesData {
    date: string;
    totalSales: number;
    totalRevenue: number;
  }
  
  export interface ExportOptions {
    format: string;
    fileName: string;
    includeDailyData: boolean;
  }
  interface SalesUpdate {
    eventId: number;
    eventName: string;
    quantity: number;
    amount: number;
    timestamp: Date;
  }