import type { Bike, Ride, BikePart } from "../interfaces/bike";
import { MaterielService } from "./MaterielService";

export class VeloService {

    private materielService: MaterielService;

    constructor(){
        this.materielService = new MaterielService();
    }

    public getAllBikes(): Bike[]{
        const bikes = localStorage.getItem("bikes");
        const rides = localStorage.getItem("rides");
        const bikeParts = localStorage.getItem("bikeParts");

        const parsedRides: Ride[] = rides ? JSON.parse(rides) : [];
        const parsedBikeParts: BikePart[] = bikeParts ? JSON.parse(bikeParts) : [];
        const parsedBikes: Bike[] = bikes ? JSON.parse(bikes) : [];

        parsedBikes.forEach(bike => {
            bike.rides = parsedRides.filter(ride => ride.bikeId === bike.id);
            bike.parts = parsedBikeParts.filter(part => part.bikeId === bike.id);
        });

        return parsedBikes;
    }

    public getBikeById(id: string): Bike | undefined {
        const bikes = this.getAllBikes();
        return bikes.find(bike => bike.id === id);
    }

    public createBike(bike: Bike, parts: BikePart[]): Bike {
        const bikes = this.getAllBikes();
        const savedBike = {
            ...bike,
            id: bike.id || crypto.randomUUID(),
        };
        const existingIndex = bikes.findIndex(item => item.id === savedBike.id);
        if (existingIndex >= 0) {
            bikes[existingIndex] = savedBike;
        } else {
            bikes.push(savedBike);
        }
        localStorage.setItem("bikes", JSON.stringify(bikes));

        const bikeParts = localStorage.getItem("bikeParts");
        const parsedBikeParts: BikePart[] = bikeParts ? JSON.parse(bikeParts) : [];
        const otherBikeParts = parsedBikeParts.filter(part => part.bikeId !== savedBike.id);
        parts.forEach(part => {
            part.bikeId = savedBike.id;
            otherBikeParts.push(part);
        });
        localStorage.setItem("bikeParts", JSON.stringify(otherBikeParts));
        return savedBike;
    }
}
