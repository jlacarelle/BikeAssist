import type { Bike } from "../interfaces/bike";
import { apiRequest } from "./apiClient";
import { formatDateOnly } from "./StateService";

export class VeloService {
  public async saveBike(bike: Bike): Promise<void> {
    await apiRequest(`bikes/${encodeURIComponent(bike.id)}`, {
      method: "PUT",
      body: {
        name: bike.name,
        type: bike.type,
        brand: bike.brand,
        model: bike.model,
        gammeName: bike.gammeName,
        lastService: bike.lastService
          ? formatDateOnly(bike.lastService)
          : null,
        parts: bike.parts,
      },
    });
  }

  public async deleteBike(id: string): Promise<void> {
    await apiRequest(`bikes/${encodeURIComponent(id)}`, { method: "DELETE" });
  }
}
