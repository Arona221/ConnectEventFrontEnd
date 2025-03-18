// planification.model.ts
export interface Planification {
    id: number;
    datePublication: Date;
    heurePublication: string;
    campagne: CampagneMarketingUpdate;
  }
  
  export interface CampagneMarketingUpdate {
    id: number;
    nom: string;
    statut: 'Planifier' | 'En_cours' | 'Terminee' | 'Programmer';
    datePublicationPlanifiee: Date;
    heurePublicationPlanifiee: string;
    // Ajouter d'autres champs selon vos besoins
  }