// MessageMarketingUpdate.model.ts
export class MessageMarketingUpdate {
    idMessage?: number; // Identifiant unique du message
    sujet: string; // Sujet du message
    template: string; // Contenu HTML du message
    canal: Canal; // Canal de diffusion (Mailchimp, etc.)
  
    constructor(data: Partial<MessageMarketingUpdate> = {}) {
      this.idMessage = data.idMessage;
      this.sujet = data.sujet || '';
      this.template = data.template || '';
      this.canal = data.canal || Canal.MAILCHIMP;
    }
  }
  
  // Enum pour les canaux de diffusion
  export enum Canal {
    MAILCHIMP = 'MAILCHIMP',
    FACEBOOK = 'FACEBOOK',
    GOOGLE_ADS = 'GOOGLE_ADS',
    // Ajoutez d'autres canaux si nécessaire
  }