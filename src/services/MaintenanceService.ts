import { Constants } from "../common/Constants";
import type { MaintenanceEntry } from "../interfaces/bike";
import { VeloService } from "./VeloService";

export type PartReplacement = {
  bikeId: string;
  partId: number;
  newReference: string;
  newDistance: number;
  date: string;
  note: string;
};

export class MaintenanceService {
  private readonly veloService: VeloService;

  constructor(veloService: VeloService) {
    this.veloService = veloService;
  }

  public getAllEntries(): MaintenanceEntry[] {
    const entries = localStorage.getItem(Constants.MAINTENANCE_ENTRIES_KEY);
    return entries ? JSON.parse(entries) : [];
  }

  public replacePart(replacement: PartReplacement): MaintenanceEntry {
    const bike = this.veloService.getBikeById(replacement.bikeId);
    const part = bike?.parts.find((item) => item.id === replacement.partId);
    const newReference = replacement.newReference.trim();

    if (!bike || !part) {
      throw new Error("Le vélo ou la pièce sélectionnée n’existe plus.");
    }
    if (!newReference) {
      throw new Error("Le nouveau modèle est obligatoire.");
    }
    if (!Number.isFinite(replacement.newDistance) || replacement.newDistance < 0) {
      throw new Error("Le kilométrage de la pièce doit être un nombre positif.");
    }
    if (!Number.isFinite(Date.parse(replacement.date))) {
      throw new Error("La date de l’intervention est invalide.");
    }

    const entry: MaintenanceEntry = {
      id: crypto.randomUUID(),
      bikeId: bike.id,
      bikeName: bike.name,
      bikeDistance: bike.distance,
      partId: part.id,
      partName: part.name,
      previousReference: part.reference,
      previousDistance: part.distance,
      newReference,
      newDistance: replacement.newDistance,
      date: replacement.date,
      note: replacement.note.trim(),
    };

    this.veloService.replacePart(
      bike.id,
      part.id,
      newReference,
      replacement.newDistance,
    );
    const entries = this.getAllEntries();
    entries.unshift(entry);
    localStorage.setItem(
      Constants.MAINTENANCE_ENTRIES_KEY,
      JSON.stringify(entries),
    );

    return entry;
  }
}
