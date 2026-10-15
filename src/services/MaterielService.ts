import type { Gamme, MaterielAvecGamme } from "../interfaces/materiel";
import gammes from "../data/reference/gammes_shimano.json";
import specMateriel from "../data/reference/duree_de_vie.json";
import materiel from "../data/reference/materiel.json";
import type { BikePart } from "../interfaces/bike";
import { Constants } from "../common/Constants";



export class MaterielService {
    public getAll(): Gamme[] {
        // Implementation to retrieve all materiel data
        return (gammes as Gamme[]);
    }

    public getSavedParts(): BikePart[] {
        const bikeParts = localStorage.getItem(Constants.BIKE_PARTS_KEY);
        return bikeParts ? JSON.parse(bikeParts) : [];
    }

    public getSavedPartsByBike(bikeId: string): BikePart[] {
        const allParts = this.getSavedParts();
        return allParts.filter(part => part.bikeId === bikeId);
    }

    public removeSavedPartsByBike(bikeId: string): void {
        const allParts = this.getSavedParts();
        const remainingParts = allParts.filter(part => part.bikeId !== bikeId);
        localStorage.setItem(Constants.BIKE_PARTS_KEY, JSON.stringify(remainingParts));
    }

    public updateSavedParts(otherBikeParts: BikePart[]): void {
        localStorage.setItem(Constants.BIKE_PARTS_KEY, JSON.stringify(otherBikeParts));
    }

    public getMaterielByGamme(nom: string): MaterielAvecGamme | undefined {
        const spec = (specMateriel as MaterielAvecGamme[]).find(
            (item) => item.gamme === nom,
        );

        if (!spec) {
            return undefined;
        }

        return {
            gamme: spec.gamme,
            datas: spec.datas.map((data) => {
                const piece = materiel.find((item) => item.id === data.id);
                return {
                    id: data.id,
                    min_km: data.min_km,
                    max_km: data.max_km,
                    note: data.note,
                    name: piece?.name,
                    example: piece?.example,
                };
            })
        };
    }

    public updatePartsKms(bikeId: string, distance: number) {
        // Implementation to update parts' kilometers based on the bike's distance
        const bikeParts = localStorage.getItem(Constants.BIKE_PARTS_KEY);
        const parsedBikeParts: BikePart[] = bikeParts ? JSON.parse(bikeParts) : [];

        parsedBikeParts.forEach(part => {
            if (part.bikeId === bikeId) {
                part.distance += distance;
            }
        });
        localStorage.setItem(Constants.BIKE_PARTS_KEY, JSON.stringify(parsedBikeParts));
    }
}
