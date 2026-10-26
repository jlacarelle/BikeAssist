import type { Bike, Ride, BikePart } from "../interfaces/bike";
import { Constants } from "../common/Constants";
import { MaterielService } from "./MaterielService";

export class VeloService {
  private readonly materielService: MaterielService;

  constructor(materielService: MaterielService) {
    this.materielService = materielService;
  }

  public getAllBikes(): Bike[] {
    const bikes = localStorage.getItem(Constants.BIKES_KEY);
    const rides = localStorage.getItem(Constants.RIDES_KEY);

    const parsedBikeParts: BikePart[] = this.materielService.getSavedParts();
    const parsedRides: Ride[] = rides ? JSON.parse(rides) : [];

    const parsedBikes: Bike[] = bikes ? JSON.parse(bikes) : [];

    parsedBikes.forEach((bike) => {
      bike.rides = parsedRides.filter((ride) => ride.bikeId === bike.id);
      bike.parts = parsedBikeParts.filter((part) => part.bikeId === bike.id);
    });

    return parsedBikes;
  }

  public getBikeById(id: string): Bike | undefined {
    const bikes = this.getAllBikes();
    return bikes.find((bike) => bike.id === id);
  }

  public createBike(bike: Bike, parts: BikePart[]): Bike {
    const bikes = this.getAllBikes();
    const savedBike = {
      ...bike,
      id: bike.id || crypto.randomUUID(),
    };
    const existingIndex = bikes.findIndex((item) => item.id === savedBike.id);
    if (existingIndex >= 0) {
      bikes[existingIndex] = savedBike;
    } else {
      bikes.push(savedBike);
    }

    localStorage.setItem(Constants.BIKES_KEY, JSON.stringify(bikes));

    const otherBikeParts = this.materielService
      .getSavedParts()
      .filter((part) => part.bikeId !== savedBike.id);

    parts.forEach((part) => {
      part.bikeId = savedBike.id;
      otherBikeParts.push(part);
    });

    this.materielService.updateSavedParts(otherBikeParts);

    return savedBike;
  }

  public deleteBike(id: string): void {
    const bikes = this.getAllBikes().filter((bike) => bike.id !== id);
    localStorage.setItem(Constants.BIKES_KEY, JSON.stringify(bikes));

    this.materielService.removeSavedPartsByBike(id);

    const rides = localStorage.getItem(Constants.RIDES_KEY);
    const parsedRides: Ride[] = rides ? JSON.parse(rides) : [];
    localStorage.setItem(
      Constants.RIDES_KEY,
      JSON.stringify(parsedRides.filter((ride) => ride.bikeId !== id)),
    );
  }

  public updateBikeDistance(bikeId: string, distance: number): void {
    const bike = this.getBikeById(bikeId);
    if (bike) {
      console.log(`Updating distance for bike ${bikeId} by ${distance} km`);
      bike.distance = (bike.distance || 0) + distance;
      console.log(`Updated distance for bike ${bikeId} to ${bike.distance} km`);
      const bikes = this.getAllBikes();
      const existingIndex = bikes.findIndex((item) => item.id === bike.id);
      if (existingIndex >= 0) {
        bikes[existingIndex] = bike;
        localStorage.setItem(Constants.BIKES_KEY, JSON.stringify(bikes));
      }
    }
  }

  public updateBikePartsKms(bikeId: string, distance: number): void {
    this.materielService.updatePartsKms(bikeId, distance);
    this.updateBikeDistance(bikeId, distance);
  }
}
