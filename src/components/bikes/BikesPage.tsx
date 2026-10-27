import {
  useState,
  type Dispatch,
  type FC,
  type FormEvent,
  type SetStateAction,
} from "react";
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
  Title1,
} from "@fluentui/react-components";
import {
  Add24Regular,
  ArrowLeft20Regular,
  Delete20Regular,
  Edit20Regular,
  Sport24Regular,
} from "@fluentui/react-icons";
import { useDashboardStyles } from "../../App.styles";
import { useServiceScope } from "../../common/useServiceScope";
import AddBikeForm from "./AddBikeForm";
import BikeDetail from "./BikeDetail";
import type {
  Bike,
  BikePart,
  BikeTab,
  MaintenanceEntry,
  Ride,
} from "../../interfaces/bike";

type BikesPageProps = {
  bikes: Bike[];
  onBikesChange: Dispatch<SetStateAction<Bike[]>>;
  rides: Ride[];
  maintenanceEntries: MaintenanceEntry[];
  onAddRide: (bike: Bike) => void;
  onDeleteBike: (bikeId: string) => void;
};

type Page = "list" | "form" | "detail";

const number = (value: number) =>
  value.toLocaleString("fr-FR", { maximumFractionDigits: 1 });

const BikesPage: FC<BikesPageProps> = ({
  bikes,
  onBikesChange,
  rides,
  maintenanceEntries,
  onAddRide,
  onDeleteBike,
}) => {
  const styles = useDashboardStyles();
  const serviceScope = useServiceScope();
  const [page, setPage] = useState<Page>("list");
  const [selectedBikeId, setSelectedBikeId] = useState<string | null>(null);
  const [editingBikeId, setEditingBikeId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<BikeTab>("Aperçu");
  const [error, setError] = useState("");
  const [bikeToDelete, setBikeToDelete] = useState<Bike | null>(null);

  const selectedBike = bikes.find((bike) => bike.id === selectedBikeId) ?? null;
  const selectedBikeRides = selectedBike
    ? rides.filter((ride) => ride.bikeId === selectedBike.id)
    : [];
  const selectedBikeMaintenanceEntries = selectedBike
    ? maintenanceEntries.filter((entry) => entry.bikeId === selectedBike.id)
    : [];


  function openForm(bike?: Bike) {
    setEditingBikeId(bike?.id ?? null);
    setError("");
    setPage("form");
  }

  function saveBike(
    event: FormEvent<HTMLFormElement>,
    bike: Bike,
    parts: BikePart[],
  ) {
    event.preventDefault();
    const savedBike = serviceScope.veloService.createBike(bike, parts);
    onBikesChange(serviceScope.veloService.getAllBikes());

    setSelectedBikeId(savedBike.id);
    setPage(editingBikeId ? "detail" : "list");
    setError("");
  }

  return (
    <>
      <div className={styles.pageHeading}>
        <div>
          {page !== "list" && (
            <Button
              appearance="transparent"
              className={styles.backLink}
              icon={<ArrowLeft20Regular />}
              onClick={() => setPage("list")}
            >
              Retour à mon garage
            </Button>
          )}
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
            {page === "form"
              ? editingBikeId
                ? "Modifier le vélo"
                : "Ajouter un vélo"
              : page === "detail"
                ? (selectedBike?.name ?? "Détail du vélo")
                : "Mes vélos"}
          </Title1>
          <Text className={styles.muted}>
            {page === "form"
              ? "Renseignez les informations pour commencer le suivi."
              : page === "detail" && selectedBike
                ? `${selectedBike.brand} ${selectedBike.model} · ${selectedBike.type}`
                : "Votre garage, toujours prêt à prendre la route."}
          </Text>
        </div>
        {page === "list" ? (
          <Button
            appearance="primary"
            icon={<Add24Regular />}
            onClick={() => openForm()}
          >
            Ajouter un vélo
          </Button>
        ) : page === "detail" && selectedBike ? (
          <div className={styles.bikePageActions}>
            <Button
              appearance="secondary"
              icon={<Edit20Regular />}
              onClick={() => openForm(selectedBike)}
            >
              Modifier
            </Button>
            <Button
              appearance="secondary"
              className={styles.deleteBikeButton}
              icon={<Delete20Regular />}
              onClick={() => setBikeToDelete(selectedBike)}
            >
              Supprimer
            </Button>
            <Button
              appearance="primary"
              icon={<Add24Regular />}
              onClick={() => onAddRide(selectedBike)}
            >
              Ajouter une sortie
            </Button>
          </div>
        ) : null}
      </div>

      {page === "list" &&
        (bikes.length === 0 ? (
          <Text className={styles.muted}>Aucun vélo enregistré.</Text>
        ) : (
          <div className={styles.bikesGrid}>
            {bikes.map((bike) => {
              //   const attention = bike.status
              //     .toLowerCase()
              //     .includes("surveiller");
              return (
                <Card key={bike.id} className={styles.bikeCard}>
                  <div className={styles.bikeCardHeader}>
                    <span className={styles.iconTile}>
                      <Sport24Regular />
                    </span>
                    {/* <Badge
                      appearance="tint"
                      color={attention ? "warning" : "success"}
                    >
                      {bike.status}
                    </Badge> */}
                  </div>
                  <div className={styles.bikeCardSummary}>
                    <Text as="h2" size={500} weight="semibold">
                      {bike.name}
                    </Text>
                    <Text className={styles.muted}>
                      {bike.brand} {bike.model} · {bike.type}
                    </Text>
                  </div>
                  <div className={styles.bikeCardMetric}>
                    <Text size={600} weight="bold">
                      {number(bike.distance)} km
                    </Text>
                    <Text className={styles.muted}>au compteur</Text>
                  </div>
                  <div className={styles.bikeCardActions}>
                    <Button
                      appearance="primary"
                      onClick={() => {
                        setSelectedBikeId(bike.id);
                        setSelectedTab("Aperçu");
                        setPage("detail");
                      }}
                    >
                      Voir le détail
                    </Button>
                    <Button
                      appearance="subtle"
                      icon={<Edit20Regular />}
                      aria-label={`Modifier ${bike.name}`}
                      onClick={() => openForm(bike)}
                    />
                    <Button
                      appearance="subtle"
                      className={styles.deleteBikeButton}
                      icon={<Delete20Regular />}
                      aria-label={`Supprimer ${bike.name}`}
                      onClick={() => setBikeToDelete(bike)}
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        ))}

      {page === "form" && (
        <AddBikeForm
          initialBike={bikes?.find((bike) => bike.id === editingBikeId) || null}
          error={error}
          isEditing={editingBikeId !== null}
          onSubmit={saveBike}
          onCancel={() => setPage(editingBikeId ? "detail" : "list")}
        />
      )}

      {page === "detail" && selectedBike && (
        <BikeDetail
          bike={selectedBike}
          rides={selectedBikeRides}
          maintenanceEntries={selectedBikeMaintenanceEntries}
          totalDistance={selectedBike.distance}
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
          onEdit={() => openForm(selectedBike)}
          onAddRide={() => onAddRide(selectedBike)}
        />
      )}

      <Dialog
        open={bikeToDelete !== null}
        onOpenChange={(_, data) => {
          if (!data.open) setBikeToDelete(null);
        }}
      >
        <DialogSurface className={styles.deleteBikeDialog}>
          <DialogBody>
            <DialogTitle>Supprimer ce vélo ?</DialogTitle>
            <DialogContent>
              Le vélo « {bikeToDelete?.name} », ses pièces et ses sorties
              associées seront supprimés. Cette action est définitive.
            </DialogContent>
            <DialogActions className={styles.deleteBikeDialogActions}>
              <Button
                appearance="secondary"
                className={styles.deleteBikeDialogButton}
                onClick={() => setBikeToDelete(null)}
              >
                Annuler
              </Button>
              <Button
                appearance="primary"
                className={styles.deleteBikeDialogButton}
                icon={<Delete20Regular />}
                onClick={() => {
                  if (!bikeToDelete) return;
                  onDeleteBike(bikeToDelete.id);
                  setBikeToDelete(null);
                  setSelectedBikeId(null);
                  setPage("list");
                }}
              >
                Supprimer le vélo
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  );
};

export default BikesPage;
