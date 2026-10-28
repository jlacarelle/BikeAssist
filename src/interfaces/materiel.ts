export interface Version {
    generation:string;
    vitesses: number;
    type: string;
}

export interface SpecsMeteriel{
    id: number;
    name: string;
    min_km: number;
    max_km: number;
    note: string;
}

export interface Gamme {
    gamme: string;
    positionnement:string;
    versions: Version[];
}

export interface Materiel {
    id: number;
    name: string;
}

export interface MaterielAvecGamme {
    gamme: string;
    datas: SpecsMeteriel[];
}
