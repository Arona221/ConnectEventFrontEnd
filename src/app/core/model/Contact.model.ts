// Contact.model.ts
export class Contact {
    id?: number; // Identifiant unique du contact
    email: string; // Adresse e-mail du contact
    prenom: string; // Prénom du contact
    nom: string; // Nom du contact
    segmentId?: number; // Référence au segment auquel le contact appartient
  
    constructor(data: Partial<Contact> = {}) {
      this.id = data.id;
      this.email = data.email || '';
      this.prenom = data.prenom || '';
      this.nom = data.nom || '';
      this.segmentId = data.segmentId;
    }
  }