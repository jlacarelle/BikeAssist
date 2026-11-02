import type { Bike, MaintenanceEntry, Ride } from "../interfaces/bike";
import { apiRequest } from "./apiClient";

export type AppState = {
  bikes: Bike[];
  rides: Ride[];
  maintenanceEntries: MaintenanceEntry[];
};

type ApiState = {
  bikes: Array<Omit<Bike, "addedOn" | "lastService" | "rides"> & {
    addedOn: string;
    lastService?: string;
  }>;
  rides: Ride[];
  maintenanceEntries: MaintenanceEntry[];
};

// Une date YYYY-MM-DD est lue à minuit locale pour ne pas changer de jour selon le fuseau.
function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatDateOnly(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export class StateService {
  public async getState(): Promise<AppState> {
    const state = await apiRequest<ApiState>("state");
    return {
      bikes: state.bikes.map((bike) => ({
        ...bike,
        addedOn: new Date(bike.addedOn),
        lastService: bike.lastService
          ? parseDateOnly(bike.lastService)
          : undefined,
      })),
      rides: state.rides,
      maintenanceEntries: state.maintenanceEntries,
    };
  }
}
