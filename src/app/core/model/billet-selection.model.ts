import { BilletDTO } from './BilletDTO'; // Adjust the path as necessary

export interface BilletSelectionDTO {
    evenementId: number;
    participantId: number;
    billets: BilletItemDTO[]; // Array d'items
    modePaiement: 'PAYDUNYA' | 'WAVE';
}

export interface BilletItemDTO {
    billetId: number;
    quantite: number;
}