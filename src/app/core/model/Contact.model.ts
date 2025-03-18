export class Contact {
  email: string;
  prenom: string;
  nom: string;

  constructor(data: Partial<Contact> = {}) {
    this.email = data.email || '';
    this.prenom = data.prenom || '';
    this.nom = data.nom || '';
  }
}