import { BilletDTO } from './BilletDTO'; // Adjust the path as necessary

export interface PaiementResponse {
    status: string;
    message: string;
    statutPaiement: string;
    billet?: BilletDTO;  // Peut contenir un seul billet
    billets?: BilletDTO[]; // Pour gérer plusieurs billets (optionnel)
}


  