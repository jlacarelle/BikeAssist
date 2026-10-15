import type { Ride } from "./ride";
export type { Ride } from "./ride";

export type BikeType = "Route" | "Gravel" | "VTT" | "Ville";

export interface BikePart {
    name: string;
    reference: string;
    distance: number;
    id: number;
    maxDistance: number;
    isActif: boolean;
    bikeId: string;
}

export interface Bike {
    id: string;
    name: string;
    type: BikeType;
    brand: string;
    model: string;
    distance: number;
    gammeName: string;
    parts: BikePart[];
    rides?: Ride[];
    addedOn: Date;
    lastService?: Date;
}


export type BikeTab = "Aperçu" | "Pièces" | "Sorties" | "Entretiens";


