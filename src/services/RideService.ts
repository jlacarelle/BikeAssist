import { Constants } from "../common/Constants";
import type { Ride } from "../interfaces/ride";
import { VeloService } from "./VeloService";

export class RideService {

    private readonly veloService: VeloService;

    constructor(veloService: VeloService) {
        this.veloService = veloService;
    }

    public getAllRides(): Ride[]{
        const rides = localStorage.getItem(Constants.RIDES_KEY);
        return rides ? JSON.parse(rides) : [];
    }


    public createRide(ride: Ride): Ride {
        const rides = this.getAllRides();
        const savedRide = {
            ...ride,
            id: ride.id || crypto.randomUUID(),
        };
        const existingIndex = rides.findIndex(item => item.id === savedRide.id);
        if (existingIndex >= 0) {
            rides[existingIndex] = savedRide;
        } else {
            rides.push(savedRide);
        }
        this.veloService.updateBikePartsKms(savedRide.bikeId, savedRide.distance || 0);

        localStorage.setItem(Constants.RIDES_KEY, JSON.stringify(rides));



        return savedRide;
    }

    public deleteRide(id: string): void {
        const allRides = this.getAllRides();
        const deletedRide = allRides.find(ride => ride.id === id);
        const rides = allRides.filter(ride => ride.id !== id);
        localStorage.setItem(Constants.RIDES_KEY, JSON.stringify(rides));

        if (deletedRide) {
            this.veloService.updateBikePartsKms(deletedRide.bikeId, -(deletedRide.distance || 0));
        }
    }
}