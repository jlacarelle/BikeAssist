import { Button, Card, Text } from "@fluentui/react-components";
import { Map24Regular } from "@fluentui/react-icons";
import { useDashboardStyles } from "../../App.styles";
import type { Ride } from "../../interfaces/bike";

type RidesPageProps = {
  rides: Ride[];
  onSelectRide: (ride: Ride) => void;
};

const number = (value: number) =>
  value.toLocaleString("fr-FR", { maximumFractionDigits: 1 });

function RidesPage({ rides, onSelectRide }: RidesPageProps) {
  const styles = useDashboardStyles();

  return (
    <Card className={styles.dashboardCard}>
      <Text as="h2" size={400} weight="semibold">
        Toutes les sorties
      </Text>
      <div className={styles.rideList}>
        {rides.map((ride) => (
          <Button
            key={ride.id}
            appearance="transparent"
            className={styles.rideRow}
            onClick={() => onSelectRide(ride)}
          >
            <span className={styles.iconTile}>
              <Map24Regular />
            </span>
            <span className={styles.rideDescription}>
              <Text weight="semibold">{ride.name}</Text>
              <Text className={styles.muted}>
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
    </Card>
  );
}

export default RidesPage;