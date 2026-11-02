import { useState, type FC, type FormEvent } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Field,
  Input,
  Select,
  Text,
  Tooltip,
} from "@fluentui/react-components";
import {
  CheckmarkCircle20Regular,
  Dismiss24Regular,
} from "@fluentui/react-icons";
import { useDashboardStyles } from "../../App.styles";
import type { Bike } from "../../interfaces/bike";
import { getErrorMessage } from "../../services/apiClient";

type AddRideDialogProps = {
  open: boolean;
  bikes: Bike[];
  initialBikeName: string;
  onClose: () => void;
  onSubmit: (ride: {
    name: string;
    bikeName: string;
    date: string;
    distance: number;
  }) => Promise<void>;
};

const getTodayInputDate = () => {
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  return today.toISOString().slice(0, 10);
};

const AddRideDialog: FC<AddRideDialogProps> = ({
  open,
  bikes,
  initialBikeName,
  onClose,
  onSubmit,
}) => {
  const styles = useDashboardStyles();
  const [rideName, setRideName] = useState("");
  const [rideBike, setRideBike] = useState(
    initialBikeName || bikes[0]?.name || "",
  );
  const [rideDistance, setRideDistance] = useState("");
  const [rideDate, setRideDate] = useState(getTodayInputDate);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submitRide(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const distance = Number(rideDistance.replace(",", "."));
    const bikeExists = bikes.some((bike) => bike.name === rideBike);
    if (
      !rideName.trim() ||
      !bikeExists ||
      !rideDate ||
      !Number.isFinite(distance) ||
      distance <= 0
    ) {
      setError("Renseignez un nom, une date et une distance positive");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await onSubmit({
        name: rideName.trim(),
        bikeName: rideBike,
        date: rideDate,
        distance,
      });
    } catch (submissionError) {
      setError(getErrorMessage(submissionError));
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(_, data) => !data.open && onClose()}>
      <DialogSurface className={styles.rideDialog}>
        <form onSubmit={submitRide}>
          <DialogBody>
            <DialogTitle
              action={
                <Tooltip content="Fermer" relationship="label">
                  <Button
                    appearance="subtle"
                    icon={<Dismiss24Regular />}
                    aria-label="Fermer"
                    onClick={onClose}
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
                    <option key={bike.id} value={bike.name}>
                      {bike.name}
                    </option>
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
              <Field label="Distance (km)" required>
                <Input
                  value={rideDistance}
                  onChange={(_, data) => setRideDistance(data.value)}
                  inputMode="decimal"
                  placeholder="42,6"
                />
              </Field>
              {error && (
                <Text role="alert" className={styles.formError}>
                  {error}
                </Text>
              )}
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={onClose}>
                Annuler
              </Button>
              <Button
                type="submit"
                appearance="primary"
                icon={<CheckmarkCircle20Regular />}
                disabled={saving}
              >
                Ajouter la sortie
              </Button>
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  );
};

export default AddRideDialog;