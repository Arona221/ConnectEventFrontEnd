export interface FactureResponse {
    id: number;
    montant: number;
    statut: string;
    invoiceUrl: string | null;
}