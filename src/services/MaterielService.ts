import type { Gamme, MaterielAvecGamme } from "../interfaces/materiel";
import gammes from "../data/reference/gammes_shimano.json";
import specMateriel from "../data/reference/duree_de_vie.json";
import materiel from "../data/reference/materiel.json";

export class MaterielService {
    public getAll(): Gamme[] {
        // Implementation to retrieve all materiel data
        return (gammes as Gamme[]);
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
                if (!piece) {
                    throw new Error(`Le matériel ${data.id} est introuvable.`);
                }
                return {
                    id: data.id,
                    min_km: data.min_km,
                    max_km: data.max_km,
                    note: data.note,
                    name: piece.name,
                };
            })
        };
    }
}
