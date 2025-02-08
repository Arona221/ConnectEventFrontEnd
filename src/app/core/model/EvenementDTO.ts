import { Categorie } from "../enumeration/Categorie";
import { Status } from "../enumeration/Status";
import { BilletDTO } from "./BilletDTO";
export interface EvenementDTO {
  id_evenement: number;
  nom: string;
  date: Date;
  description: string;
  lieu: string;
  categorie: Categorie;
  status: Status;
  nombrePlaces: number | null;
  image: string;
  billets: BilletDTO[];
}