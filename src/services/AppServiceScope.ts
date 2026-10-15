import { MaterielService } from "./MaterielService";
import { RideService } from "./RideService";
import { VeloService } from "./VeloService";

export class AppServiceScope {
  public readonly materielService: MaterielService;
  public readonly veloService: VeloService;
  public readonly rideService: RideService;

  constructor() {
    this.materielService = new MaterielService();
    this.veloService = new VeloService(this.materielService);
    this.rideService = new RideService(this.veloService);
  }
}