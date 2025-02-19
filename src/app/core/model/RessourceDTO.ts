export interface RessourceDTO {
    id: number;
    nom: string;
    prix: number;
    image: string;
    type: TypeRessource;
  }
  
  export interface LieuDTO extends RessourceDTO {
    capacite: number;
    departement: Departement;
    adresse: string;
  }
  
  export interface TransportDTO extends RessourceDTO {
    typeTransport: string;
    nombrePlaces: number;
  }
  
  export interface EquipementDTO extends RessourceDTO {
    typeEquipement: string;
    quantite: number;
    specifications: string;
  }
  
  export enum TypeRessource {
    LIEU = 'LIEU',
    TRANSPORT = 'TRANSPORT',
    EQUIPEMENT = 'EQUIPEMENT'
  }
  
  export enum Departement {
    DAKAR = 'DAKAR',
    THIES = 'THIES',
    MBOUR = 'MBOUR',
    TIVAOUANE = 'TIVAOUANE',
    PIKINE = 'PIKINE'
  }