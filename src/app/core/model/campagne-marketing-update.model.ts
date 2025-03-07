export interface CampagneMarketingUpdate {
  id: number;
  nom: string;
  budget: number;
  dateDebut: string;
  dateFin: string;
  statut: string;
  expediteurEmail: string;
  idMessage?: number;
  idSegment?: number;
  id_evenement?: number;
} 