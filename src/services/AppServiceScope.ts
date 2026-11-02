import { MaterielService } from "./MaterielService";
import { RideService } from "./RideService";
import { VeloService } from "./VeloService";
import { MaintenanceService } from "./MaintenanceService";
import { StateService } from "./StateService";

export class AppServiceScope {
  public readonly materielService: MaterielService;
  public readonly veloService: VeloService;
  public readonly rideService: RideService;
  public readonly maintenanceService: MaintenanceService;
  public readonly stateService: StateService;

  constructor() {
    this.materielService = new MaterielService();
    this.veloService = new VeloService();
    this.rideService = new RideService();
    this.maintenanceService = new MaintenanceService();
    this.stateService = new StateService();
  }
}