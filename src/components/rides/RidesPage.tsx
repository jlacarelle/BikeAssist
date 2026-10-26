import {
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Text,
} from "@fluentui/react-components";
import { Delete20Regular, Map24Regular } from "@fluentui/react-icons";
import { useState } from "react";
import { useDashboardStyles } from "../../App.styles";
import type { Ride } from "../../interfaces/bike";

type RidesPageProps = {
  rides: Ride[];
  onSelectRide: (ride: Ride) => void;
  onDeleteRide: (rideId: string) => void;
};

const number = (value: number) =>
  value.toLocaleString("fr-FR", { maximumFractionDigits: 1 });

function RidesPage({ rides, onSelectRide, onDeleteRide }: RidesPageProps) {
  const styles = useDashboardStyles();
  const [rideToDelete, setRideToDelete] = useState<Ride | null>(null);

  return (
    <Card className={styles.dashboardCard}>
      <Text as="h2" size={400} weight="semibold">
        Toutes les sorties
      </Text>
      <div className={styles.rideList}>
        {rides.map((ride) => (
          <div key={ride.id} className={styles.rideRow}>
            <Button
              appearance="transparent"
              className={styles.rideSelectButton}
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
            <Button
              appearance="subtle"
              className={styles.rideDeleteButton}
              icon={<Delete20Regular />}
              aria-label={`Supprimer ${ride.name}`}
              title={`Supprimer ${ride.name}`}
              onClick={() => setRideToDelete(ride)}
            />
          </div>
        ))}
        {rides.length === 0 && (
          <Text className={styles.muted}>Aucune sortie enregistrée.</Text>
        )}
      </div>
      <Dialog
        open={rideToDelete !== null}
        onOpenChange={(_, data) => {
          if (!data.open) setRideToDelete(null);
        }}
      >
        <DialogSurface className={styles.deleteBikeDialog}>
          <DialogBody>
            <DialogTitle>Supprimer cette sortie ?</DialogTitle>
            <DialogContent>
              La sortie « {rideToDelete?.name} » sera supprimée définitivement.
            </DialogContent>
            <DialogActions className={styles.deleteBikeDialogActions}>
              <Button
                appearance="secondary"
                className={styles.deleteBikeDialogButton}
                onClick={() => setRideToDelete(null)}
              >
                Annuler
              </Button>
              <Button
                appearance="primary"
                className={styles.deleteBikeDialogButton}
                icon={<Delete20Regular />}
                onClick={() => {
                  if (!rideToDelete) return;
                  onDeleteRide(rideToDelete.id);
                  setRideToDelete(null);
                }}
              >
                Supprimer la sortie
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </Card>
  );
}

export default RidesPage;
