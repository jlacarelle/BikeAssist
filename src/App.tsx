import { useState } from "react";
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
  Field,
  Image,
  Input,
  ProgressBar,
  Select,
  Text,
  Title1,
  Tooltip,
  mergeClasses,
} from "@fluentui/react-components";
import {
  Add24Regular,
  ArrowRight20Regular,
  CheckmarkCircle20Regular,
  Dismiss24Regular,
  QuestionCircle20Regular,
  Settings24Regular,
  Sport24Regular,
  Map24Regular,
} from "@fluentui/react-icons";
import bikeIllustration from "../design/assets/gravel-bike-illustration.png";
import { useDashboardStyles, useGlobalStyles } from "./App.styles";
import BikesPage from "./components/BikesPage";
import SideMenu, { type SideMenuView } from "./components/SideMenu";
import type { Bike, Ride } from "./interfaces/bike";
import React from "react";
import { VeloService } from "./services/VeloService";

type View = SideMenuView;
const number = (value: number) =>
  value.toLocaleString("fr-FR", { maximumFractionDigits: 1 });
const getTodayInputDate = () => {
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  return today.toISOString().slice(0, 10);
};

function App() {
  useGlobalStyles();
  const styles = useDashboardStyles();
  const [view, setView] = useState<View>("Vue d’ensemble");
  const [bikes, setBikes] = useState<Bike[]>(() =>
    new VeloService().getAllBikes(),
  );
  const [rides, setRides] = useState<Ride[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [rideName, setRideName] = useState("");
  const [rideBike, setRideBike] = useState("");
  const [rideDistance, setRideDistance] = useState("");
  const [rideDate, setRideDate] = useState(getTodayInputDate);
  const [rideMinutes, setRideMinutes] = useState("");
  const [error, setError] = useState("");
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
    setView(nextView);
  }

  function saveRide(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const bike = bikes.find((item) => item.name === rideBike);
    const distance = Number(rideDistance.replace(",", "."));
    const minutes = Number(rideMinutes);
    if (
      !rideName.trim() ||
      !bike ||
      !rideDate ||
      !Number.isFinite(distance) ||
      distance <= 0 ||
      !Number.isInteger(minutes) ||
      minutes <= 0
    ) {
      setError(
        "Renseignez un nom, une date, une distance positive et une durée en minutes entières.",
      );
      return;
    }
    setRides([
      {
        id: Date.now(),
        name: rideName.trim(),
        bike: rideBike,
        bikeId: bike.id,
        date: new Date(`${rideDate}T12:00:00`).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
        }),
        distance,
        duration: `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, "0")}`,
      },
      ...rides,
    ]);
    setAddOpen(false);
    setRideName("");
    setRideDistance("");
    setRideMinutes("");
    setError("");
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
              <Text className={mergeClasses(styles.muted, styles.small)}>
                {ride.duration}
              </Text>
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
                {bike.name} · {part.reference || bike.brand}
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
              <Button
                appearance="primary"
                icon={<Add24Regular />}
                disabled={bikes.length === 0}
                onClick={() => {
                  setRideBike(bikes[0]?.name ?? "");
                  setError("");
                  setAddOpen(true);
                }}
              >
                Ajouter une sortie
              </Button>
            </div>
          )}
          {view === "Mes vélos" && (
            <BikesPage
              bikes={bikes}
              onBikesChange={setBikes}
              rides={rides}
              onAddRide={(bike) => {
                setRideBike(bike.name);
                setError("");
                setAddOpen(true);
              }}
            />
          )}
          {view === "Vue d’ensemble" && (
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
          )}
          {view === "Sorties" && (
            <Card className={styles.dashboardCard}>
              <Text as="h2" size={400} weight="semibold">
                Toutes les sorties
              </Text>
              {rideList(true)}
            </Card>
          )}
          {view === "Entretiens" && (
            <Card className={styles.dashboardCard}>
              <div className={styles.panelHeading}>
                <Text as="h2" size={400} weight="semibold">
                  Suivi des composants
                </Text>
                {partsToWatch.length > 0 && (
                  <Badge color="warning" appearance="tint">
                    {partsToWatch.length} à surveiller
                  </Badge>
                )}
              </div>
              {wearList()}
            </Card>
          )}
        </main>
      </div>
      <Dialog open={addOpen} onOpenChange={(_, data) => setAddOpen(data.open)}>
        <DialogSurface className={styles.rideDialog}>
          <form onSubmit={saveRide}>
            <DialogBody>
              <DialogTitle
                action={
                  <Tooltip content="Fermer" relationship="label">
                    <Button
                      appearance="subtle"
                      icon={<Dismiss24Regular />}
                      aria-label="Fermer"
                      onClick={() => setAddOpen(false)}
                    />
                  </Tooltip>
                }
              >
                Ajouter une sortie
              </DialogTitle>
              <DialogContent className={styles.rideForm}>
                <Field label="Nom de la sortie" required>
                  <Input
                    value={rideName}
                    onChange={(_, data) => setRideName(data.value)}
                    placeholder="Nom de la sortie"
                  />
                </Field>
                <Field label="Vélo" required>
                  <Select
                    value={rideBike}
                    onChange={(_, data) => setRideBike(data.value)}
                    required
                  >
                    <option value="" disabled>
                      Choisir un vélo
                    </option>
                    {bikes.map((bike) => (
                      <option key={bike.name}>{bike.name}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Date" required>
                  <Input
                    type="date"
                    value={rideDate}
                    onChange={(_, data) => setRideDate(data.value)}
                    required
                  />
                </Field>
                <div className={styles.formColumns}>
                  <Field label="Distance (km)" required>
                    <Input
                      value={rideDistance}
                      onChange={(_, data) => setRideDistance(data.value)}
                      inputMode="decimal"
                      placeholder="42,6"
                    />
                  </Field>
                  <Field label="Durée (minutes)" required>
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      value={rideMinutes}
                      onChange={(_, data) => setRideMinutes(data.value)}
                      placeholder="112"
                    />
                  </Field>
                </div>
                {error && (
                  <Text role="alert" className={styles.formError}>
                    {error}
                  </Text>
                )}
              </DialogContent>
              <DialogActions>
                <Button
                  appearance="secondary"
                  onClick={() => setAddOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  appearance="primary"
                  icon={<CheckmarkCircle20Regular />}
                >
                  Ajouter la sortie
                </Button>
              </DialogActions>
            </DialogBody>
          </form>
        </DialogSurface>
      </Dialog>
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
              <Text>Durée : {selectedRide?.duration}</Text>
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
