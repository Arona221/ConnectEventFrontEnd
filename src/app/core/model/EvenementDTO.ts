import { Categorie } from "../enumeration/Categorie";
import { Status } from "../enumeration/Status";
import { BilletDTO } from "./BilletDTO";
export interface EvenementDTO {
  id_evenement: number;
  nom: string;
  date: Date;
  heure: string;
  description: string;
  lieu: string;
  categorie: Categorie;
  status: Status;
  nombrePlaces: number | null;
  imageUrl?: string;
  imagePath?: string;
  billets: BilletDTO[];
}