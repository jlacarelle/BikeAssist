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
import SideMenu, { type SideMenuView } from "./components/SideMenu";

type View = SideMenuView;
type Ride = {
  id: number;
  name: string;
  bike: string;
  date: string;
  distance: number;
  duration: string;
};
const bikes = [
  {
    name: "Gravel du quotidien",
    model: "Gravel · Shimano GRX",
    distance: 1840,
    status: "Chaîne à surveiller",
  },
  {
    name: "Vélo de route",
    model: "Route · Shimano 105",
    distance: 640,
    status: "Tout est à jour",
  },
];
const initialRides: Ride[] = [
  {
    id: 1,
    name: "Boucle des bords de Marne",
    bike: bikes[0].name,
    date: "Hier",
    distance: 42.6,
    duration: "1 h 52",
  },
  {
    id: 2,
    name: "Forêt de Ferrières",
    bike: bikes[1].name,
    date: "12 oct.",
    distance: 36.2,
    duration: "1 h 34",
  },
  {
    id: 3,
    name: "Sortie du dimanche",
    bike: bikes[0].name,
    date: "8 oct.",
    distance: 58.1,
    duration: "2 h 28",
  },
];
const parts = [
  {
    name: "Chaîne",
    description: "Gravel du quotidien · Shimano",
    distance: 460,
    limit: 500,
  },
  {
    name: "Cassette",
    description: "Gravel du quotidien · 12 vitesses",
    distance: 1220,
    limit: 2500,
  },
  {
    name: "Plateaux",
    description: "Gravel du quotidien · 40 dents",
    distance: 2800,
    limit: 5000,
  },
];
const number = (value: number) =>
  value.toLocaleString("fr-FR", { maximumFractionDigits: 1 });

function App() {
  useGlobalStyles();
  const styles = useDashboardStyles();
  const [view, setView] = useState<View>("Vue d’ensemble");
  const [rides, setRides] = useState(initialRides);
  const [addOpen, setAddOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [rideName, setRideName] = useState("");
  const [rideBike, setRideBike] = useState(bikes[0].name);
  const [rideDistance, setRideDistance] = useState("");
  const [rideDate, setRideDate] = useState("2026-10-16");
  const [rideMinutes, setRideMinutes] = useState("");
  const [error, setError] = useState("");
  const addedRides = rides.filter((ride) => ride.id > 3);
  const addedDistance = addedRides.reduce(
    (total, ride) => total + ride.distance,
    0,
  );

  function saveRide(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const distance = Number(rideDistance.replace(",", "."));
    const minutes = Number(rideMinutes);
    if (
      !rideName.trim() ||
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
      </div>
    );
  }

  function wearList() {
    return (
      <div className={styles.wearList}>
        {parts.map((part) => (
          <div className={styles.wearRow} key={part.name}>
            <div>
              <Text weight="semibold">{part.name}</Text>
              <Text className={mergeClasses(styles.muted, styles.small)}>
                {part.description}
              </Text>
            </div>
            <ProgressBar
              value={part.distance / part.limit}
              color={part.distance / part.limit > 0.85 ? "warning" : "success"}
              aria-label={`Usure ${part.name} : ${Math.round((part.distance / part.limit) * 100)} %`}
            />
            <div className={styles.wearDistance}>
              <Text weight="semibold">{number(part.distance)} km</Text>
              <Text className={mergeClasses(styles.muted, styles.small)}>
                sur {number(part.limit)} km
              </Text>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.appShell}>
      <SideMenu
        view={view}
        onViewChange={setView}
        onHelp={() => setHelpOpen(true)}
      />
      <div className={styles.workspace}>
        <header className={styles.topbar}>
          <Text className={styles.muted}>Votre espace · {view}</Text>
          <div className={styles.topbarActions}>
            <Text className={styles.demoStatus}>
              <span className={styles.statusDot} /> Mode démo
            </Text>
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
          <div className={styles.pageHeading}>
            <div>
              <Text className={styles.dateLabel}>VENDREDI 16 OCTOBRE 2026</Text>
              <Title1 as="h1">
                {view === "Vue d’ensemble" ? "Bonjour Julien" : view}
              </Title1>
              <Text className={styles.muted}>
                {view === "Vue d’ensemble"
                  ? "Un œil sur vos vélos, l’esprit libre pour rouler."
                  : view === "Mes vélos"
                    ? "Votre garage, toujours prêt à prendre la route."
                    : view === "Sorties"
                      ? "Chaque kilomètre compte."
                      : "L’usure de vos pièces, en un coup d’œil."}
              </Text>
            </div>
            <Button
              appearance="primary"
              icon={<Add24Regular />}
              onClick={() => {
                setError("");
                setAddOpen(true);
              }}
            >
              Ajouter une sortie
            </Button>
          </div>
          {view === "Vue d’ensemble" && (
            <>
              <section
                className={styles.garageBanner}
                aria-label="Bilan annuel"
              >
                <div className={styles.bannerCopy}>
                  <Text className={styles.garageStatus}>
                    <span className={styles.statusDot} /> VOTRE GARAGE SE PORTE
                    BIEN
                  </Text>
                  <div className={styles.annualDistance}>
                    <Text>{number(2480 + addedDistance)}</Text>
                    <Text>km</Text>
                  </div>
                  <Text className={styles.bannerSubtitle}>
                    parcourus cette année avec vos vélos
                  </Text>
                  <div className={styles.bannerBottom}>
                    <Badge appearance="tint" color="success">
                      Tout est à jour
                    </Badge>
                    <Text>+ {number(320 + addedDistance)} km ce mois-ci</Text>
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
                    value: "02",
                    detail: "1 vélo à surveiller",
                    icon: <Sport24Regular />,
                  },
                  {
                    label: "Sorties ce mois-ci",
                    value: String(12 + addedRides.length),
                    detail: "Dernière sortie · " + rides[0].date.toLowerCase(),
                    icon: <Map24Regular />,
                  },
                  {
                    label: "Entretiens à prévoir",
                    value: "01",
                    detail: "Chaîne · dans 40 km",
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
                    <Badge color="warning" appearance="tint">
                      1 bientôt
                    </Badge>
                  </div>
                  {wearList()}
                  <Button
                    className={styles.textLink}
                    appearance="transparent"
                    icon={<ArrowRight20Regular />}
                    iconPosition="after"
                    onClick={() => setView("Mes vélos")}
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
                      onClick={() => setView("Sorties")}
                    >
                      Tout voir
                    </Button>
                  </div>
                  {rideList()}
                </Card>
              </div>
            </>
          )}
          {view === "Mes vélos" && (
            <div className={styles.bikesGrid}>
              {bikes.map((bike) => (
                <Card key={bike.name} className={styles.bikeCard}>
                  <span className={styles.iconTile}>
                    <Sport24Regular />
                  </span>
                  <Text as="h2" size={500} weight="semibold">
                    {bike.name}
                  </Text>
                  <Text className={styles.muted}>{bike.model}</Text>
                  <Text size={600} weight="bold">
                    {number(
                      bike.distance +
                        addedRides
                          .filter((ride) => ride.bike === bike.name)
                          .reduce((total, ride) => total + ride.distance, 0),
                    )}{" "}
                    km
                  </Text>
                  <Badge
                    appearance="tint"
                    color={bike.name === bikes[0].name ? "warning" : "success"}
                  >
                    {bike.status}
                  </Badge>
                  <Button
                    appearance="subtle"
                    onClick={() => setView("Entretiens")}
                  >
                    Voir les entretiens
                  </Button>
                </Card>
              ))}
            </div>
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
                <Badge color="warning" appearance="tint">
                  1 bientôt
                </Badge>
              </div>
              {wearList()}
              <Text className={styles.muted}>
                Prochain entretien : remplacement de la chaîne du Gravel du
                quotidien dans 40 km.
              </Text>
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
                    placeholder="Boucle des bords de Marne"
                  />
                </Field>
                <Field label="Vélo">
                  <Select
                    value={rideBike}
                    onChange={(_, data) => setRideBike(data.value)}
                  >
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
                BikeAssist rassemble vos vélos, sorties et entretiens. Cet écran
                utilise des données fictives. Les sorties ajoutées sont
                conservées uniquement pendant cette session et disparaissent au
                rechargement.
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
