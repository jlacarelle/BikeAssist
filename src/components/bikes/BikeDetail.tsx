import {
  Badge,
  Button,
  Card,
  ProgressBar,
  Tab,
  TabList,
  Text,
} from "@fluentui/react-components";
import {
  Add24Regular,
  Edit20Regular,
  Map24Regular,
  Sport24Regular,
} from "@fluentui/react-icons";
import { useDashboardStyles } from "../../App.styles";
import type { Bike, BikeTab, Ride } from "../../interfaces/bike";

type BikeDetailProps = {
  bike: Bike;
  rides: Ride[];
  totalDistance: number;
  selectedTab: BikeTab;
  onTabChange: (tab: BikeTab) => void;
  onEdit: () => void;
  onAddRide: () => void;
};

const number = (value: number) =>
  value.toLocaleString("fr-FR", { maximumFractionDigits: 1 });

function BikeDetail({
  bike,
  rides,
  totalDistance,
  selectedTab,
  onTabChange,
  onEdit,
  onAddRide,
}: BikeDetailProps) {
  const styles = useDashboardStyles();
  const nextPart = bike.parts.reduce((nearest, part) =>
    part.maxDistance - part.distance < nearest.maxDistance - nearest.distance
      ? part
      : nearest,
  );
  const remainingDistance = Math.max(
    0,
    nextPart.maxDistance - nextPart.distance,
  );

  function partCards() {
    return (
      <div className={styles.bikePartsGrid}>
        {bike.parts.map((part) => {
          const progress = Math.min(part.distance / part.maxDistance, 1);
          const attention = progress >= 0.85;
          return (
            <div className={styles.bikePartCard} key={part.name}>
              <div className={styles.partCardHeading}>
                <Text weight="semibold">{part.name}</Text>
                <Badge
                  appearance="tint"
                  color={attention ? "warning" : "success"}
                >
                  {attention ? "À prévoir" : "Bon état"}
                </Badge>
              </div>
              <Text className={styles.muted}>
                {part.reference || "Référence non renseignée"}
              </Text>
              <ProgressBar
                value={progress}
                color={attention ? "warning" : "success"}
                aria-label={`Usure ${part.name} : ${Math.round(progress * 100)} %`}
              />
              <div className={styles.partDistanceLine}>
                <Text>{number(part.distance)} km parcourus</Text>
                <Text>{number(part.maxDistance)} km conseillés</Text>
              </div>
              <Text className={styles.muted}>
                {attention
                  ? `Il reste environ ${number(Math.max(0, part.maxDistance - part.distance))} km avant remplacement.`
                  : `Environ ${number(part.maxDistance - part.distance)} km avant contrôle.`}
              </Text>
            </div>
          );
        })}
      </div>
    );
  }

  function rideRows() {
    if (rides.length === 0) {
      return (
        <Text className={styles.muted}>
          Aucune sortie enregistrée pour ce vélo.
        </Text>
      );
    }
    return (
      <div className={styles.bikeRideList}>
        {rides.map((ride) => (
          <div className={styles.bikeRideRow} key={ride.id}>
            <span className={styles.iconTile}>
              <Map24Regular />
            </span>
            <div className={styles.bikeRideName}>
              <Text weight="semibold">{ride.name}</Text>
              <Text className={styles.muted}>{ride.date}</Text>
            </div>
            <Text weight="semibold">{number(ride.distance)} km</Text>
          </div>
        ))}
      </div>
    );
  }

  function serviceHistory() {
    return (
      <div className={styles.serviceHistory}>
        <div className={styles.serviceEntry}>
          <Text weight="semibold">23</Text>
          <Text className={styles.muted}>SEPT.</Text>
          <span className={styles.serviceDot} />
          <div>
            <Text weight="semibold">Révision complète</Text>
            <Text className={styles.muted}>Contrôle de la transmission</Text>
          </div>
        </div>
        <div className={styles.serviceEntry}>
          <Text weight="semibold">30</Text>
          <Text className={styles.muted}>AOÛT</Text>
          <span className={styles.serviceDot} />
          <div>
            <Text weight="semibold">Chaîne remplacée</Text>
            <Text className={styles.muted}>Shimano CN-M7100</Text>
          </div>
        </div>
        <div className={styles.serviceEntry}>
          <Text weight="semibold">12</Text>
          <Text className={styles.muted}>AVR.</Text>
          <span className={styles.serviceDot} />
          <div>
            <Text weight="semibold">Vélo ajouté au garage</Text>
            <Text className={styles.muted}>{bike.addedOn}</Text>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className={styles.bikeMetricGrid} aria-label="Résumé du vélo">
        <Card className={styles.bikeMetricCard}>
          <div>
            <Text className={styles.muted}>Kilométrage total</Text>
            <Text className={styles.bikeMetricValue}>
              {number(totalDistance)} km
            </Text>
            <Text className={styles.muted}>Depuis le {bike.addedOn}</Text>
          </div>
          <span className={styles.iconTile}>
            <Sport24Regular />
          </span>
        </Card>
        <Card className={styles.bikeMetricCard}>
          <div>
            <Text className={styles.muted}>Dernier entretien</Text>
            <Text className={styles.bikeMetricValue}>{bike.lastService}</Text>
            <Text className={styles.muted}>Révision complète</Text>
          </div>
          <span className={styles.iconTile}>
            <Edit20Regular />
          </span>
        </Card>
        <Card className={styles.bikeMetricCard}>
          <div>
            <Text className={styles.muted}>Prochaine attention</Text>
            <Text className={styles.bikeMetricValue}>
              {number(remainingDistance)} km
            </Text>
            <Text className={styles.muted}>
              {nextPart.name} à remplacer bientôt
            </Text>
          </div>
          <span className={styles.iconTile}>
            <Add24Regular />
          </span>
        </Card>
      </section>

      <TabList
        className={styles.bikeTabs}
        selectedValue={selectedTab}
        onTabSelect={(_, data) => onTabChange(data.value as BikeTab)}
        aria-label="Sections de la fiche vélo"
      >
        <Tab value="Aperçu">Aperçu</Tab>
        <Tab value="Pièces">Pièces</Tab>
        <Tab value="Sorties">Sorties</Tab>
        <Tab value="Entretiens">Entretiens</Tab>
      </TabList>

      {selectedTab === "Aperçu" && (
        <div className={styles.bikeDetailGrid}>
          <div className={styles.bikeDetailMain}>
            <Card className={styles.bikeDetailCard}>
              <div className={styles.panelHeading}>
                <div>
                  <Text as="h2" size={400} weight="semibold">
                    Pièces suivies
                  </Text>
                  <Text className={styles.muted}>
                    Kilométrage depuis le dernier remplacement.
                  </Text>
                </div>
                <Button
                  appearance="transparent"
                  className={styles.textLink}
                  onClick={() => onTabChange("Pièces")}
                >
                  Gérer les pièces
                </Button>
              </div>
              {partCards()}
            </Card>
            <Card className={styles.bikeDetailCard}>
              <div className={styles.panelHeading}>
                <div>
                  <Text as="h2" size={400} weight="semibold">
                    Dernières sorties
                  </Text>
                  <Text className={styles.muted}>
                    Les kilomètres s’ajoutent au vélo et à ses pièces.
                  </Text>
                </div>
                <Button
                  appearance="transparent"
                  className={styles.textLink}
                  onClick={() => onTabChange("Sorties")}
                >
                  Historique complet
                </Button>
              </div>
              {rideRows()}
            </Card>
          </div>
          <div className={styles.bikeDetailAside}>
            <Card className={styles.bikeDetailCard}>
              <div className={styles.panelHeading}>
                <Text as="h2" size={400} weight="semibold">
                  Informations du vélo
                </Text>
              </div>
              <dl className={styles.bikeInfoList}>
                <div>
                  <dt>Marque</dt>
                  <dd>{bike.brand}</dd>
                </div>
                <div>
                  <dt>Modèle</dt>
                  <dd>{bike.model || "Non renseigné"}</dd>
                </div>
                <div>
                  <dt>Type</dt>
                  <dd>{bike.type}</dd>
                </div>
                <div>
                  <dt>Transmission</dt>
                  <dd>{bike.gammeName || "Non renseignée"}</dd>
                </div>
                <div>
                  <dt>Ajouté le</dt>
                  <dd>{"non renseigné"}</dd>
                </div>
              </dl>
              <Button
                appearance="transparent"
                className={styles.textLink}
                icon={<Edit20Regular />}
                onClick={onEdit}
              >
                Modifier les informations
              </Button>
            </Card>
            <Card className={styles.bikeDetailCard}>
              <div className={styles.panelHeading}>
                <Text as="h2" size={400} weight="semibold">
                  Historique d’entretien
                </Text>
                <Badge>{3}</Badge>
              </div>
              {serviceHistory()}
              <Button
                appearance="transparent"
                className={styles.textLink}
                onClick={() => onTabChange("Entretiens")}
              >
                Voir les entretiens
              </Button>
            </Card>
          </div>
        </div>
      )}
      {selectedTab === "Pièces" && (
        <Card className={styles.bikeDetailCard}>
          <div className={styles.panelHeading}>
            <div>
              <Text as="h2" size={400} weight="semibold">
                Pièces suivies
              </Text>
              <Text className={styles.muted}>
                Usure calculée à partir des sorties enregistrées.
              </Text>
            </div>
          </div>
          {partCards()}
        </Card>
      )}
      {selectedTab === "Sorties" && (
        <Card className={styles.bikeDetailCard}>
          <div className={styles.panelHeading}>
            <div>
              <Text as="h2" size={400} weight="semibold">
                Sorties avec ce vélo
              </Text>
              <Text className={styles.muted}>
                Historique des kilomètres parcourus.
              </Text>
            </div>
            <Button
              appearance="primary"
              icon={<Add24Regular />}
              onClick={onAddRide}
            >
              Ajouter une sortie
            </Button>
          </div>
          {rideRows()}
        </Card>
      )}
      {selectedTab === "Entretiens" && (
        <Card className={styles.bikeDetailCard}>
          <div className={styles.panelHeading}>
            <div>
              <Text as="h2" size={400} weight="semibold">
                Historique d’entretien
              </Text>
              <Text className={styles.muted}>
                Les interventions et contrôles de votre vélo.
              </Text>
            </div>
          </div>
          {serviceHistory()}
        </Card>
      )}
    </>
  );
}

export default BikeDetail;
