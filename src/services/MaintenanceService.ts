import { Constants } from "../common/Constants";
import type { MaintenanceEntry } from "../interfaces/bike";
import { VeloService } from "./VeloService";

export type PartReplacement = {
  bikeId: string;
  partId: number;
  newMaxDistance: number;
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
    if (!entries) {
      return [];
    }

    const storedEntries: Array<
      MaintenanceEntry & { previousReference?: string; newReference?: string }
    > = JSON.parse(entries);
    const normalizedEntries = storedEntries.map((entry) => {
      const normalizedEntry = { ...entry };
      delete normalizedEntry.previousReference;
      delete normalizedEntry.newReference;
      return normalizedEntry;
    });

    if (JSON.stringify(normalizedEntries) !== entries) {
      localStorage.setItem(
        Constants.MAINTENANCE_ENTRIES_KEY,
        JSON.stringify(normalizedEntries),
      );
    }

    return normalizedEntries;
  }

  public replacePart(replacement: PartReplacement): MaintenanceEntry {
    const bike = this.veloService.getBikeById(replacement.bikeId);
    const part = bike?.parts.find((item) => item.id === replacement.partId);

    if (!bike || !part) {
      throw new Error("Le vélo ou la pièce sélectionnée n’existe plus.");
    }
    if (
      !Number.isFinite(replacement.newMaxDistance) ||
      replacement.newMaxDistance <= 0
    ) {
      throw new Error("Le kilométrage maximal conseillé doit être supérieur à zéro.");
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
      previousDistance: part.distance,
      newDistance: replacement.newDistance,
      date: replacement.date,
      note: replacement.note.trim(),
    };

    this.veloService.replacePart(
      bike.id,
      part.id,
      replacement.newMaxDistance,
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
