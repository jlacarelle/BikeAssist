import { useState, type FC, type FormEvent } from "react";
import {
  Button,
  Card,
  Field,
  Input,
  Radio,
  RadioGroup,
  Select,
  Text,
} from "@fluentui/react-components";
import {
  CheckmarkCircle20Regular,
  ShieldCheckmark20Regular,
} from "@fluentui/react-icons";
import { useDashboardStyles } from "../../App.styles";
import { useServiceScope } from "../../common/useServiceScope";
import type { Gamme, MaterielAvecGamme } from "../../interfaces/materiel";
import { type Bike, type BikeType, type BikePart } from "../../interfaces/bike";

type AddBikeFormProps = {
  initialBike?: Bike | null;
  error: string;
  isEditing: boolean;
  onSubmit: (
    event: FormEvent<HTMLFormElement>,
    bike: Bike,
    parts: BikePart[],
  ) => void;
  onCancel: () => void;
};

const AddBikeForm: FC<AddBikeFormProps> = ({
  initialBike,
  error,
  isEditing,
  onSubmit,
  onCancel,
}) => {
  const styles = useDashboardStyles();
  const { materielService } = useServiceScope();

  const gammes: Gamme[] = materielService.getAll();

  const [selectedGamme, setSelectedGamme] = useState<Gamme | null>(() =>
    initialBike
      ? (gammes?.find((gamme) => initialBike.gammeName === gamme.gamme) ?? null)
      : (gammes?.[0] ?? null),
  );
  const [materiel, setMateriel] = useState<MaterielAvecGamme | null>(
    selectedGamme
      ? (materielService.getMaterielByGamme(selectedGamme.gamme) ?? null)
      : null,
  );

  const getDefaultMateriel = (
    bikeId: string,
    materielSource: MaterielAvecGamme | null = materiel,
  ): BikePart[] => {
    return (
      materielSource?.datas.map(
        (data) =>
          ({
            bikeId: bikeId,
            name: data.name,
            distance: 0,
            isActif: true,
            id: data.id,
            maxDistance: data.max_km,
          }),
      ) ?? []
    );
  };

  const defaultID = crypto.randomUUID();
  const [bike, setBike] = useState<Bike>(
    initialBike ?? {
      id: defaultID,
      name: "",
      type: "Route",
      brand: "",
      model: "",
      distance: 0,
      gammeName: selectedGamme?.gamme ?? "",
      parts: getDefaultMateriel(defaultID),
      addedOn: new Date(),
    },
  );

  const onChangeGamme = (value: string) => {
    const gamme = gammes.find((item) => item.gamme === value) ?? null;
    const gammeMateriel = gamme
      ? (materielService.getMaterielByGamme(gamme.gamme) ?? null)
      : null;
    setSelectedGamme(gamme);
    setBike((current) => ({
      ...current,
      gammeName: gamme?.gamme ?? "",
      parts: getDefaultMateriel(current.id, gammeMateriel),
    }));
    setMateriel(gammeMateriel);
  };

  return (
    <div className={styles.bikeFormLayout}>
      <form
        className={styles.bikeForm}
        onSubmit={(event) => onSubmit(event, bike, bike.parts)}
      >
        <Card className={styles.bikeFormCard}>
          <Text as="h2" className={styles.formSectionTitle} weight="semibold">
            Informations générales
          </Text>
          <div className={styles.bikeFormFields}>
            <Field label="Nom du vélo" required>
              <Input
                value={bike.name}
                onChange={(_, data) =>
                  setBike((current) => ({ ...current, name: data.value }))
                }
                placeholder="Nom du vélo"
                required
              />
            </Field>
            <Field label="Type de vélo" required>
              <RadioGroup
                layout="horizontal"
                value={bike.type}
                onChange={(_, data) =>
                  setBike((current) => ({
                    ...current,
                    type: data.value as BikeType,
                  }))
                }
                aria-label="Type de vélo"
              >
                <Radio value="Route" label="Route" />
                <Radio value="Gravel" label="Gravel" />
                <Radio value="VTT" label="VTT" />
                <Radio value="Ville" label="Ville" />
              </RadioGroup>
            </Field>
            <div className={styles.formColumns}>
              <Field label="Marque" required>
                <Input
                  value={bike.brand}
                  onChange={(_, data) =>
                    setBike((current) => ({ ...current, brand: data.value }))
                  }
                  placeholder="Marque"
                  required
                />
              </Field>
              <Field label="Modèle">
                <Input
                  value={bike.model}
                  onChange={(_, data) =>
                    setBike((current) => ({ ...current, model: data.value }))
                  }
                  placeholder="Modèle"
                />
              </Field>
            </div>
            <div className={styles.formColumns}>
              <Field label="Kilométrage actuel (km)" required>
                <Input
                  type="number"
                  min={0}
                  value={bike.distance?.toString()}
                  onChange={(_, data) =>
                    setBike((current) => {
                      const distance = Number(data.value);

                      for (const part of current.parts) {
                        console.log(part.distance);
                        part.distance = distance;
                        console.log(`Updated distance for part ${part.name}: ${part.distance}`);
                      }

                      console.log(current.parts);

                      return {
                        ...current,
                        distance,
                        parts: current.parts
                      };
                    })
                  }
                  required
                />
              </Field>
              <Field label="Groupe / transmission">
                <Select
                  value={selectedGamme?.gamme ?? ""}
                  onChange={(_, data) => {
                    onChangeGamme(data.value);
                  }}
                >
                  {gammes.map((gamme) => (
                    <option key={gamme.gamme} value={gamme.gamme}>
                      {gamme.gamme}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </div>

          <div className={styles.formSectionDivider} />
          <div className={styles.formSectionHeading}>
            <Text as="h2" className={styles.formSectionTitle} weight="semibold">
              Pièces à suivre
            </Text>
            <Text className={styles.muted}>
              Vous pourrez les modifier à tout moment.
            </Text>
          </div>
          <div className={styles.bikePartFields}>
            {materiel?.datas.map((data) => (
              <div className={styles.bikePartFormRow} key={data.id}>
                <Field
                  label={`${data.name} · kilométrage maximal conseillé (km)`}
                >
                  <Input
                    type="number"
                    min="1"
                    value={
                      bike?.parts
                        ?.find((part) => part.id === data.id)
                        ?.maxDistance?.toString() ?? String(data.max_km)
                    }
                    onChange={(_, inputData) =>
                      setBike((current) => ({
                        ...current,
                        parts: current.parts.map((part) =>
                          part.id === data.id
                            ? { ...part, maxDistance: Number(inputData.value) }
                            : part,
                        ),
                      }))
                    }
                  />
                </Field>
              </div>
            ))}
          </div>
          {error && (
            <Text role="alert" className={styles.formError}>
              {error}
            </Text>
          )}
          <div className={styles.bikeFormActions}>
            <Button type="button" appearance="secondary" onClick={onCancel}>
              Annuler
            </Button>
            <Button
              type="submit"
              appearance="primary"
              icon={<CheckmarkCircle20Regular />}
            >
              {isEditing
                ? "Enregistrer les modifications"
                : "Enregistrer le vélo"}
            </Button>
          </div>
        </Card>
      </form>

      <aside className={styles.bikeFormAside}>
        <Card className={styles.formAsideCard}>
          <span className={styles.iconTile}>
            <CheckmarkCircle20Regular />
          </span>
          <Text weight="semibold">Un suivi simple et utile</Text>
          <Text className={styles.muted}>
            BikeAssist calcule le kilométrage de chaque pièce à partir des
            sorties enregistrées.
          </Text>
        </Card>
        <div className={styles.localDataNote}>
          <ShieldCheckmark20Regular />
          <Text>
            Vos informations restent enregistrées localement sur cet appareil.
          </Text>
        </div>
      </aside>
    </div>
  );
};

export default AddBikeForm;
