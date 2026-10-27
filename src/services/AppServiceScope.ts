import { MaterielService } from "./MaterielService";
import { RideService } from "./RideService";
import { VeloService } from "./VeloService";
import { MaintenanceService } from "./MaintenanceService";

export class AppServiceScope {
  public readonly materielService: MaterielService;
  public readonly veloService: VeloService;
  public readonly rideService: RideService;
  public readonly maintenanceService: MaintenanceService;

  constructor() {
    this.materielService = new MaterielService();
    this.veloService = new VeloService(this.materielService);
    this.rideService = new RideService(this.veloService);
    this.maintenanceService = new MaintenanceService(this.veloService);
  }
}