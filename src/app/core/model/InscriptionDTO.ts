export type TypeUtilisateur = 'PARTICIPANT' | 'ORGANISATEUR' | 'EQUIPEMARKETING';

export interface InscriptionDTO {
  prenom: string;
  nom: string;
  email: string;
  motDePasse: string;
  phoneNumber: string;
  typeUtilisateur: TypeUtilisateur; // Utilisation du type défini
}
