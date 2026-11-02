import type { Ride } from "../interfaces/ride";
import { apiRequest } from "./apiClient";

export class RideService {
  public async createRide(ride: Ride): Promise<void> {
    await apiRequest("rides", {
      method: "POST",
      body: {
        id: ride.id,
        name: ride.name,
        bikeId: ride.bikeId,
        date: ride.date,
        distance: ride.distance,
      },
    });
  }

  public async deleteRide(id: string): Promise<void> {
    await apiRequest(`rides/${encodeURIComponent(id)}`, { method: "DELETE" });
  }
}
