import { apiRequest } from "./apiClient";

export type PartReplacement = {
  bikeId: string;
  partId: number;
  newMaxDistance: number;
  newDistance: number;
  date: string;
  note: string;
};

export class MaintenanceService {
  public async replacePart(replacement: PartReplacement): Promise<void> {
    await apiRequest("maintenance", { method: "POST", body: replacement });
  }
}
