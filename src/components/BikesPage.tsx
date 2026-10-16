import {
  useState,
  type Dispatch,
  type FC,
  type FormEvent,
  type SetStateAction,
} from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Button, Card, Text, Title1 } from "@fluentui/react-components";
import {
  Add24Regular,
  ArrowLeft20Regular,
  Edit20Regular,
  Sport24Regular,
} from "@fluentui/react-icons";
import { useDashboardStyles } from "../App.styles";
import AddBikeForm from "./AddBikeForm";
import BikeDetail from "./BikeDetail";
import type { Bike, BikePart, BikeTab, Ride } from "../interfaces/bike";
import { VeloService } from "../services/VeloService";

type Page = "list" | "form" | "detail";

type BikesPageProps = {
  page: Page;
  bikes: Bike[];
  onBikesChange: Dispatch<SetStateAction<Bike[]>>;
  rides: Ride[];
  onAddRide: (bike: Bike) => void;
};

const number = (value: number) =>
  value.toLocaleString("fr-FR", { maximumFractionDigits: 1 });

const BikesPage: FC<BikesPageProps> = ({
  page,
  bikes,
  onBikesChange,
  rides,
  onAddRide,
}) => {
  const styles = useDashboardStyles();
  const navigate = useNavigate();
  const { bikeId } = useParams();
  const [selectedTab, setSelectedTab] = useState<BikeTab>("Aperçu");
  const [error, setError] = useState("");

  const selectedBike = bikes.find((bike) => bike.id === bikeId) ?? null;
  const editingBikeId = page === "form" ? bikeId : undefined;
  const selectedBikeRides = selectedBike
    ? rides.filter((ride) => ride.bikeId === selectedBike.id)
    : [];
  const selectedBikeDistance = selectedBike
    ? selectedBike.distance +
      selectedBikeRides.reduce((total, ride) => total + ride.distance, 0)
    : 0;
  function openForm(bike?: Bike) {
    setError("");
    navigate(bike ? `/garage/${bike.id}/edit` : "/garage/new");
  }

  function saveBike(
    event: FormEvent<HTMLFormElement>,
    bike: Bike,
    parts: BikePart[],
  ) {
    event.preventDefault();
    const veloService = new VeloService();

    const savedBike = veloService.createBike(bike, parts);
    onBikesChange(veloService.getAllBikes());

    navigate(editingBikeId ? `/garage/${savedBike.id}` : "/garage");
    setError("");
  }

  if (
    (page === "detail" || editingBikeId !== undefined) &&
    !selectedBike
  ) {
    return <Navigate to="/garage" replace />;
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
              onClick={() =>
                navigate(editingBikeId ? `/garage/${editingBikeId}` : "/garage")
              }
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
              const mileage =
                bike.distance +
                rides
                  .filter((ride) => ride.bikeId === bike.id)
                  .reduce((total, ride) => total + ride.distance, 0);
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
                      {number(mileage)} km
                    </Text>
                    <Text className={styles.muted}>au compteur</Text>
                  </div>
                  <div className={styles.bikeCardActions}>
                    <Button
                      appearance="primary"
                      onClick={() => {
                        setSelectedTab("Aperçu");
                        navigate(`/garage/${bike.id}`);
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
          isEditing={Boolean(editingBikeId)}
          onSubmit={saveBike}
          onCancel={() =>
            navigate(editingBikeId ? `/garage/${editingBikeId}` : "/garage")
          }
        />
      )}

      {page === "detail" && selectedBike && (
        <BikeDetail
          bike={selectedBike}
          rides={selectedBikeRides}
          totalDistance={selectedBikeDistance}
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
          onEdit={() => openForm(selectedBike)}
          onAddRide={() => onAddRide(selectedBike)}
        />
      )}
    </>
  );
};

export default BikesPage;
