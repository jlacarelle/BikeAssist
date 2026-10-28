import { useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Image,
  ProgressBar,
  Text,
  Title1,
  mergeClasses,
} from "@fluentui/react-components";
import {
  Add24Regular,
  ArrowRight20Regular,
  QuestionCircle20Regular,
  Settings24Regular,
  Sport24Regular,
  Map24Regular,
} from "@fluentui/react-icons";
import bikeIllustration from "../design/assets/gravel-bike-illustration.png";
import { useDashboardStyles, useGlobalStyles } from "./App.styles";
import { useServiceScope } from "./common/useServiceScope";
import BikesPage from "./components/bikes/BikesPage";
import AddRideDialog from "./components/rides/AddRideDialog";
import RidesPage from "./components/rides/RidesPage";
import MaintenancePage from "./components/maintenance/MaintenancePage";
import SideMenu, { type SideMenuView } from "./components/SideMenu";
import type { Bike, MaintenanceEntry, Ride } from "./interfaces/bike";
import type { PartReplacement } from "./services/MaintenanceService";

type View = SideMenuView;
const viewPaths: Record<View, string> = {
  "Vue d’ensemble": "/",
  "Mes vélos": "/bikes",
  Sorties: "/rides",
  Entretiens: "/maintenance",
};

const pathViews: Record<string, View> = Object.fromEntries(
  Object.entries(viewPaths).map(([view, path]) => [path, view]),
) as Record<string, View>;

const number = (value: number) =>
  value.toLocaleString("fr-FR", { maximumFractionDigits: 1 });
function App() {
  useGlobalStyles();
  const styles = useDashboardStyles();
  const serviceScope = useServiceScope();
  const location = useLocation();
  const navigate = useNavigate();
  const view = pathViews[location.pathname] ?? "Vue d’ensemble";
  const [bikes, setBikes] = useState<Bike[]>(() =>
    serviceScope.veloService.getAllBikes(),
  );
  const [rides, setRides] = useState<Ride[]>(() =>
    serviceScope.rideService.getAllRides(),
  );
  const [maintenanceEntries, setMaintenanceEntries] = useState<
    MaintenanceEntry[]
  >(() => serviceScope.maintenanceService.getAllEntries());
  const [addOpen, setAddOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [initialRideBike, setInitialRideBike] = useState("");
  const totalRideDistance = rides.reduce(
    (total, ride) => total + ride.distance,
    0,
  );
  const partsToWatch = bikes.flatMap((bike) =>
    bike.parts
      .filter(
        (part) =>
          part.maxDistance > 0 && part.distance / part.maxDistance >= 0.85,
      )
      .map((part) => ({ bike, part })),
  );

  function navigateToView(nextView: View) {
    navigate(viewPaths[nextView]);
  }

  function saveRide(ride: {
    name: string;
    bikeName: string;
    date: string;
    distance: number;
  }) {
    const bike = bikes.find((item) => item.name === ride.bikeName);
    if (!bike) return;
    serviceScope.rideService.createRide({
      id: crypto.randomUUID(),
      name: ride.name,
      bike: ride.bikeName,
      bikeId: bike.id,
      date: new Date(`${ride.date}T12:00:00`).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
      }),
      distance: ride.distance,
    });
    setRides(serviceScope.rideService.getAllRides());
    setBikes(serviceScope.veloService.getAllBikes());
    setAddOpen(false);
  }

  function deleteRide(rideId: string) {
    serviceScope.rideService.deleteRide(rideId);
    setRides(serviceScope.rideService.getAllRides());
    setBikes(serviceScope.veloService.getAllBikes());
    setSelectedRide((currentRide) =>
      currentRide?.id === rideId ? null : currentRide,
    );
  }

  function replacePart(replacement: PartReplacement) {
    serviceScope.maintenanceService.replacePart(replacement);
    setMaintenanceEntries(serviceScope.maintenanceService.getAllEntries());
    setBikes(serviceScope.veloService.getAllBikes());
  }

  function rideList(all = false) {
    return (
      <div className={styles.rideList}>
        {(all ? rides : rides.slice(0, 3)).map((ride) => (
          <Button
            key={ride.id}
            appearance="transparent"
            className={styles.rideRow}
            onClick={() => setSelectedRide(ride)}
          >
            <span className={styles.iconTile}>
              <Map24Regular />
            </span>
            <span className={styles.rideDescription}>
              <Text weight="semibold">{ride.name}</Text>
              <Text className={mergeClasses(styles.muted, styles.small)}>
                {ride.date} · {ride.bike}
              </Text>
            </span>
            <span className={styles.rideDistance}>
              <Text weight="semibold">{number(ride.distance)} km</Text>
            </span>
          </Button>
        ))}
        {rides.length === 0 && (
          <Text className={styles.muted}>Aucune sortie enregistrée.</Text>
        )}
      </div>
    );
  }

  function wearList() {
    const components = bikes.flatMap((bike) =>
      bike.parts.map((part) => ({ bike, part })),
    );

    return (
      <div className={styles.wearList}>
        {components.map(({ bike, part }) => (
          <div className={styles.wearRow} key={`${bike.id}-${part.name}`}>
            <div>
              <Text weight="semibold">{part.name}</Text>
              <Text className={mergeClasses(styles.muted, styles.small)}>
                {bike.name} · {bike.brand}
              </Text>
            </div>
            <ProgressBar
              value={part.distance / part.maxDistance}
              color={
                part.distance / part.maxDistance > 0.85 ? "warning" : "success"
              }
              aria-label={`Usure ${part.name} sur ${bike.name} : ${Math.round((part.distance / part.maxDistance) * 100)} %`}
            />
            <div className={styles.wearDistance}>
              <Text weight="semibold">{number(part.distance)} km</Text>
              <Text className={mergeClasses(styles.muted, styles.small)}>
                sur {number(part.maxDistance)} km
              </Text>
            </div>
          </div>
        ))}
        {components.length === 0 && (
          <Text className={styles.muted}>Aucune pièce renseignée.</Text>
        )}
      </div>
    );
  }

  return (
    <div className={styles.appShell}>
      <SideMenu
        view={view}
        onViewChange={navigateToView}
        onHelp={() => setHelpOpen(true)}
      />
      <div className={styles.workspace}>
        <header className={styles.topbar}>
          <Text className={styles.muted}>Votre espace · {view}</Text>
          <div className={styles.topbarActions}>
            <Button
              appearance="transparent"
              size="small"
              icon={<QuestionCircle20Regular />}
              onClick={() => setHelpOpen(true)}
            >
              Aide
            </Button>
          </div>
        </header>
        <main className={styles.mainContent}>
          {view !== "Mes vélos" && (
            <div className={styles.pageHeading}>
              <div>
                <Text className={styles.dateLabel}>
                  {new Intl.DateTimeFormat("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                    .format(new Date())
                    .toLocaleUpperCase("fr-FR")}
                </Text>
                <Title1 as="h1">
                  {view === "Vue d’ensemble" ? "Votre garage" : view}
                </Title1>
                <Text className={styles.muted}>
                  {view === "Vue d’ensemble"
                    ? "Un œil sur vos vélos, l’esprit libre pour rouler."
                    : view === "Sorties"
                      ? "Chaque kilomètre compte."
                      : "L’usure de vos pièces, en un coup d’œil."}
                </Text>
              </div>
              {view !== "Entretiens" && (
                <Button
                  appearance="primary"
                  icon={<Add24Regular />}
                  disabled={bikes.length === 0}
                  onClick={() => {
                    setInitialRideBike(bikes[0]?.name ?? "");
                    setAddOpen(true);
                  }}
                >
                  Ajouter une sortie
                </Button>
              )}
            </div>
          )}
          <Routes>
            <Route
              path="/bikes"
              element={
            <BikesPage
              bikes={bikes}
              onBikesChange={setBikes}
              rides={rides}
              maintenanceEntries={maintenanceEntries}
              onDeleteBike={(bikeId) => {
                serviceScope.veloService.deleteBike(bikeId);
                setBikes(serviceScope.veloService.getAllBikes());
                setRides((currentRides) =>
                  currentRides.filter((ride) => ride.bikeId !== bikeId),
                );
              }}
              onAddRide={(bike) => {
                setInitialRideBike(bike.name);
                setAddOpen(true);
              }}
            />
              }
            />
            <Route
              path="/"
              element={
              <>
              <section
                className={styles.garageBanner}
                aria-label="Bilan annuel"
              >
                <div className={styles.bannerCopy}>
                  <Text className={styles.garageStatus}>
                    <span className={styles.statusDot} /> VOTRE GARAGE
                  </Text>
                  <div className={styles.annualDistance}>
                    <Text>{number(totalRideDistance)}</Text>
                    <Text>km</Text>
                  </div>
                  <Text className={styles.bannerSubtitle}>
                    parcourus sur vos sorties enregistrées
                  </Text>
                  <div className={styles.bannerBottom}>
                    <Badge appearance="tint" color="success">
                      {bikes.length === 0
                        ? "Garage vide"
                        : partsToWatch.length === 0
                          ? "Tout est à jour"
                          : `${partsToWatch.length} pièce(s) à surveiller`}
                    </Badge>
                    <Text>{rides.length} sortie(s) enregistrée(s)</Text>
                  </div>
                </div>
                <Image
                  src={bikeIllustration}
                  alt="Vélo gravel vert"
                  className={styles.bikeIllustration}
                />
              </section>
              <section
                className={styles.statsGrid}
                aria-label="Statistiques du garage"
              >
                {[
                  {
                    label: "Vélos dans le garage",
                    value: String(bikes.length).padStart(2, "0"),
                    detail: `${partsToWatch.length} pièce(s) à surveiller`,
                    icon: <Sport24Regular />,
                  },
                  {
                    label: "Sorties enregistrées",
                    value: String(rides.length),
                    detail: rides[0]?.date ?? "Aucune sortie enregistrée",
                    icon: <Map24Regular />,
                  },
                  {
                    label: "Entretiens à prévoir",
                    value: String(partsToWatch.length),
                    detail: partsToWatch[0]
                      ? `${partsToWatch[0].part.name} · ${partsToWatch[0].bike.name}`
                      : bikes.length === 0
                        ? "Aucun vélo enregistré"
                        : "Aucune alerte d’entretien",
                    icon: <Settings24Regular />,
                  },
                ].map((stat) => (
                  <Card key={stat.label} className={styles.statCard}>
                    <div>
                      <Text className={styles.statLabel}>{stat.label}</Text>
                      <Text className={styles.statNumber}>{stat.value}</Text>
                      <Text
                        className={mergeClasses(styles.muted, styles.small)}
                      >
                        {stat.detail}
                      </Text>
                    </div>
                    <span className={styles.iconTile}>{stat.icon}</span>
                  </Card>
                ))}
              </section>
              <div className={styles.dashboardPanels}>
                <Card className={styles.dashboardCard}>
                  <div className={styles.panelHeading}>
                    <div>
                      <Text as="h2" size={400} weight="semibold">
                        À surveiller
                      </Text>
                      <Text className={styles.muted}>
                        L’usure de vos pièces, en un coup d’œil.
                      </Text>
                    </div>
                    {partsToWatch.length > 0 && (
                      <Badge color="warning" appearance="tint">
                        {partsToWatch.length} à surveiller
                      </Badge>
                    )}
                  </div>
                  {wearList()}
                  <Button
                    className={styles.textLink}
                    appearance="transparent"
                    icon={<ArrowRight20Regular />}
                    iconPosition="after"
                    onClick={() => navigateToView("Mes vélos")}
                  >
                    Voir mes vélos
                  </Button>
                </Card>
                <Card className={styles.dashboardCard}>
                  <div className={styles.panelHeading}>
                    <div>
                      <Text as="h2" size={400} weight="semibold">
                        Sorties récentes
                      </Text>
                      <Text className={styles.muted}>
                        Votre activité des derniers jours.
                      </Text>
                    </div>
                    <Button
                      className={styles.textLink}
                      appearance="transparent"
                      icon={<ArrowRight20Regular />}
                      iconPosition="after"
                      onClick={() => navigateToView("Sorties")}
                    >
                      Tout voir
                    </Button>
                  </div>
                  {rideList()}
                </Card>
              </div>
              </>
              }
            />
            <Route
              path="/rides"
              element={
                <RidesPage
                  rides={rides}
                  onSelectRide={setSelectedRide}
                  onDeleteRide={deleteRide}
                />
              }
            />
            <Route
              path="/maintenance"
              element={
                <MaintenancePage
                  bikes={bikes}
                  entries={maintenanceEntries}
                  onReplacePart={replacePart}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      {addOpen && (
        <AddRideDialog
          open={addOpen}
          bikes={bikes}
          initialBikeName={initialRideBike}
          onClose={() => setAddOpen(false)}
          onSubmit={saveRide}
        />
      )}
      <Dialog
        open={helpOpen}
        onOpenChange={(_, data) => setHelpOpen(data.open)}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Centre d’aide</DialogTitle>
            <DialogContent>
              <Text>
                BikeAssist rassemble vos vélos, sorties et entretiens. Les vélos
                et sorties ajoutés sont conservés uniquement pendant cette
                session et disparaissent au rechargement.
              </Text>
            </DialogContent>
            <DialogActions>
              <Button appearance="primary" onClick={() => setHelpOpen(false)}>
                Fermer
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
      <Dialog
        open={selectedRide !== null}
        onOpenChange={(_, data) => {
          if (!data.open) setSelectedRide(null);
        }}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>{selectedRide?.name}</DialogTitle>
            <DialogContent className={styles.rideForm}>
              <Text>
                {selectedRide?.date} · {selectedRide?.bike}
              </Text>
              <Text size={600} weight="semibold">
                {number(selectedRide?.distance ?? 0)} km
              </Text>
            </DialogContent>
            <DialogActions>
              <Button
                appearance="primary"
                onClick={() => setSelectedRide(null)}
              >
                Fermer
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
}

export default App;
