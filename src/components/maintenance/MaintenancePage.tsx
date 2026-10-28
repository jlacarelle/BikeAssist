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
  Input,
  ProgressBar,
  Text,
  Textarea,
} from "@fluentui/react-components";
import { Settings24Regular, WrenchScrewdriver20Regular } from "@fluentui/react-icons";
import { useState, type FormEvent } from "react";
import type { Bike, BikePart, MaintenanceEntry } from "../../interfaces/bike";
import type { PartReplacement } from "../../services/MaintenanceService";
import { useDashboardStyles } from "../../App.styles";

type MaintenancePageProps = {
  bikes: Bike[];
  entries: MaintenanceEntry[];
  onReplacePart: (replacement: PartReplacement) => void;
};

const number = (value: number) =>
  value.toLocaleString("fr-FR", { maximumFractionDigits: 1 });

function localDateInputValue() {
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  return today.toISOString().slice(0, 10);
}

function MaintenancePage({
  bikes,
  entries,
  onReplacePart,
}: MaintenancePageProps) {
  const styles = useDashboardStyles();
  const [selectedPart, setSelectedPart] = useState<{
    bike: Bike;
    part: BikePart;
  } | null>(null);
  const [newMaxDistance, setNewMaxDistance] = useState("0");
  const [newDistance, setNewDistance] = useState("0");
  const [date, setDate] = useState(localDateInputValue);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  function openReplacement(bike: Bike, part: BikePart) {
    setSelectedPart({ bike, part });
    setNewMaxDistance(String(part.maxDistance));
    setNewDistance("0");
    setDate(localDateInputValue());
    setNote("");
    setError("");
  }

  function submitReplacement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedPart) return;

    const maxDistance = Number(newMaxDistance);
    const distance = Number(newDistance);
    if (
      !newMaxDistance.trim() ||
      !Number.isFinite(maxDistance) ||
      maxDistance <= 0
    ) {
      setError("Le kilométrage maximal conseillé doit être supérieur à zéro.");
      return;
    }
    if (!newDistance.trim() || !Number.isFinite(distance) || distance < 0) {
      setError("Le kilométrage doit être un nombre positif ou nul.");
      return;
    }
    if (!date) {
      setError("Renseignez la date de l’intervention.");
      return;
    }

    try {
      onReplacePart({
        bikeId: selectedPart.bike.id,
        partId: selectedPart.part.id,
        newMaxDistance: maxDistance,
        newDistance: distance,
        date,
        note,
      });
      setSelectedPart(null);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "L’intervention n’a pas pu être enregistrée.",
      );
    }
  }

  function formatDate(dateValue: string) {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(`${dateValue}T12:00:00`));
  }

  const sortedEntries = [...entries].sort(
    (first, second) => second.date.localeCompare(first.date),
  );

  return (
    <>
      <div className={styles.maintenanceLayout}>
        <Card className={styles.dashboardCard}>
          <div className={styles.panelHeading}>
            <div>
              <Text as="h2" size={400} weight="semibold">
                Pièces de vos vélos
              </Text>
              <Text className={styles.muted}>
                Remplacez une pièce pour repartir sur un nouveau suivi d’usure.
              </Text>
            </div>
            <span className={styles.iconTile}>
              <Settings24Regular />
            </span>
          </div>
          {bikes.length === 0 ? (
            <Text className={styles.muted}>
              Ajoutez d’abord un vélo pour planifier un entretien.
            </Text>
          ) : (
            <div className={styles.maintenanceBikeList}>
              {bikes.map((bike) => (
                <section
                  key={bike.id}
                  className={styles.maintenanceBike}
                  aria-label={`Pièces de ${bike.name}`}
                >
                  <div className={styles.maintenanceBikeHeading}>
                    <Text weight="semibold">{bike.name}</Text>
                    <Text className={styles.muted}>
                      {bike.brand} {bike.model} · {number(bike.distance)} km au
                      compteur
                    </Text>
                  </div>
                  {bike.parts.map((part) => {
                    const progress =
                      part.maxDistance > 0
                        ? Math.min(part.distance / part.maxDistance, 1)
                        : 0;
                    const needsAttention = progress >= 0.85;

                    return (
                      <div
                        key={`${bike.id}-${part.id}`}
                        className={styles.maintenancePart}
                      >
                        <div className={styles.maintenancePartInfo}>
                          <Text weight="semibold">{part.name}</Text>
                          <Text className={styles.muted}>
                            {number(part.distance)} km parcourus ·{" "}
                            {number(part.maxDistance)} km conseillés
                          </Text>
                        </div>
                        <ProgressBar
                          value={progress}
                          color={needsAttention ? "warning" : "success"}
                          aria-label={`${part.name} : ${Math.round(progress * 100)} % d’usure`}
                        />
                        <Badge
                          appearance="tint"
                          color={needsAttention ? "warning" : "success"}
                        >
                          {needsAttention ? "À remplacer" : "En service"}
                        </Badge>
                        <Button
                          appearance="secondary"
                          icon={<WrenchScrewdriver20Regular />}
                          onClick={() => openReplacement(bike, part)}
                        >
                          Remplacer
                        </Button>
                      </div>
                    );
                  })}
                </section>
              ))}
            </div>
          )}
        </Card>

        <Card className={styles.dashboardCard}>
          <div className={styles.panelHeading}>
            <div>
              <Text as="h2" size={400} weight="semibold">
                Journal d’entretien
              </Text>
              <Text className={styles.muted}>
                Historique des remplacements effectués.
              </Text>
            </div>
            <Badge appearance="tint">{sortedEntries.length}</Badge>
          </div>
          {sortedEntries.length === 0 ? (
            <Text className={styles.muted}>
              Vos interventions apparaîtront ici après le premier remplacement.
            </Text>
          ) : (
            <div className={styles.serviceHistory}>
              {sortedEntries.map((entry) => {
                const entryDate = new Date(`${entry.date}T12:00:00`);
                return (
                  <div className={styles.serviceEntry} key={entry.id}>
                    <Text weight="semibold">
                      {entryDate.toLocaleDateString("fr-FR", {
                        day: "2-digit",
                      })}
                    </Text>
                    <Text className={styles.muted}>
                      {entryDate
                        .toLocaleDateString("fr-FR", { month: "short" })
                        .replace(".", "")
                        .toUpperCase()}
                    </Text>
                    <span className={styles.serviceDot} />
                    <div className={styles.maintenanceHistoryDetail}>
                      <Text weight="semibold">
                        {entry.partName} remplacé · {entry.bikeName}
                      </Text>
                      <Text className={styles.muted}>
                        {number(entry.previousDistance)} km →{" "}
                        {number(entry.newDistance)} km
                      </Text>
                      <Text className={styles.muted}>
                        Vélo à {number(entry.bikeDistance)} km ·{" "}
                        {formatDate(entry.date)}
                      </Text>
                      {entry.note && (
                        <Text className={styles.maintenanceNote}>
                          {entry.note}
                        </Text>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <Dialog
        open={selectedPart !== null}
        onOpenChange={(_, data) => {
          if (!data.open) setSelectedPart(null);
        }}
      >
        <DialogSurface>
          <form onSubmit={submitReplacement}>
            <DialogBody>
              <DialogTitle>Remplacer une pièce</DialogTitle>
              <DialogContent className={styles.maintenanceForm}>
                <Text className={styles.muted}>
                  {selectedPart?.part.name} · {selectedPart?.bike.name}
                </Text>
                <Text>
                  {number(selectedPart?.part.distance ?? 0)} km parcourus ·{" "}
                  {number(selectedPart?.part.maxDistance ?? 0)} km conseillés
                </Text>
                <div className={styles.formColumns}>
                  <Field label="Kilométrage maximal conseillé (km)" required>
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      value={newMaxDistance}
                      onChange={(_, data) => setNewMaxDistance(data.value)}
                      required
                    />
                  </Field>
                  <Field label="Kilométrage actuel (km)" required>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={newDistance}
                      onChange={(_, data) => setNewDistance(data.value)}
                      required
                    />
                  </Field>
                </div>
                <Field label="Date de remplacement" required>
                  <Input
                    type="date"
                    value={date}
                    onChange={(_, data) => setDate(data.value)}
                    required
                  />
                </Field>
                <Field label="Note (facultatif)">
                  <Textarea
                    value={note}
                    onChange={(_, data) => setNote(data.value)}
                    resize="vertical"
                  />
                </Field>
                {error && (
                  <Text role="alert" className={styles.formError}>
                    {error}
                  </Text>
                )}
              </DialogContent>
              <DialogActions>
                <Button
                  appearance="secondary"
                  onClick={() => setSelectedPart(null)}
                >
                  Annuler
                </Button>
                <Button appearance="primary" type="submit">
                  Enregistrer le remplacement
                </Button>
              </DialogActions>
            </DialogBody>
          </form>
        </DialogSurface>
      </Dialog>
    </>
  );
}

export default MaintenancePage;
