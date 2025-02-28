export interface SalesMetrics {
  id: number;
  eventId: number;
  eventName: string;
  organisateurId: number;
  totalRevenue: number;
  totalTicketsSold: number;
  lastUpdated: Date;
  ticketsByType?: TicketSales[];
  dailyData?: DailySalesData[];
}

interface TicketSales {
  type: string; // Changer de ticketType à type
  quantity: number;
  revenue: number; // Changer de montantTotal à revenue
}

export interface DailySalesData {
  date: string;
  totalSales: number;
  totalRevenue: number;
  hourlyBreakdown?: HourlySalesData[];
}

export interface HourlySalesData {
  hour: string;
  sales: number;
}

export interface ExportOptions {
  format: 'pdf' | 'excel';
  fileName: string;
  includeDailyData: boolean;
}

export interface Sale {
  id: number;
  timestamp: Date;
  quantity: number;
  eventName: string;
  amount: number;
}

export interface FactureResponse {
  status: string;
  message: string;
  paymentUrl?: string;
  referenceTransaction?: string;
}

export interface PaiementResponse {
  status: string;
  message: string;
  billet?: any;
}