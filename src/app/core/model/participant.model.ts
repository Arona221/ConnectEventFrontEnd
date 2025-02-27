export interface BilletParticipant {
    id: number;
    eventNom: string;
    eventLieu: string;
    eventDate: Date;
    typeBillet: string;
    quantite: number;
    montantTotal: number;
    statut: string;
    referenceTransaction: string;
    prix: number;
    qrCodeUrl: string;
}
