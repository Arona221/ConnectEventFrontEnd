export interface EventParticipants {
    eventId: number;
    eventName: string;
    eventDate: string; // ou Date si vous convertissez en objet Date
    participantCount: number;
    totalTicketsSold: number;
  }

export interface ParticipantDetails {
  id: number;
  prenom: string;
  nom: string;
  tickets: { [type: string]: number };
}