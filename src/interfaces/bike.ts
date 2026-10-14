export type BikeType = "Route" | "Gravel" | "VTT" | "Ville";

export interface BikePart {
    name: string;
    reference: string;
    distance: number;
    limit: number;
    id: string;
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

export interface Ride {
    id: number;
    name: string;
    bike: string;
    bikeId: string;
    date: string;
    distance: number;
    duration: string;
}

export type BikeTab = "Aperçu" | "Pièces" | "Sorties" | "Entretiens";


