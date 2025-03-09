export interface ParticipantDetails {
  prenom: string;
  nom: string;
  email: string;
  tickets: { 
    [ticketType: string]: number 
  };
}