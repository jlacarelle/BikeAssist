const { HttpError } = require("./http");
const { toDateOnly } = require("./repository");

const BIKE_TYPES = ["Route", "Gravel", "VTT", "Ville"];

function requireText(value, label, maxLength) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new HttpError(400, `${label} est obligatoire.`);
  }
  if (value.length > maxLength) {
    throw new HttpError(400, `${label} est trop long.`);
  }
  return value.trim();
}

function optionalText(value, label, maxLength) {
  if (value === undefined || value === null || value === "") {
    return "";
  }
  return requireText(value, label, maxLength);
}

function requireNumber(value, label, { min = -Infinity, strict = false, integer = false } = {}) {
  const number = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  const valid =
    typeof number === "number" &&
    Number.isFinite(number) &&
    (strict ? number > min : number >= min) &&
    (!integer || Number.isInteger(number));
  if (!valid) {
    throw new HttpError(400, label);
  }
  return number;
}

function validateBike(body, routeId) {
  const id = routeId ?? body?.id;
  if (typeof body?.type !== "string" || !BIKE_TYPES.includes(body.type)) {
    throw new HttpError(400, "Le type de vélo est invalide.");
  }
  const parts = Array.isArray(body.parts) ? body.parts : [];
  return {
    id: requireText(id, "L’identifiant du vélo", 64),
    name: requireText(body.name, "Le nom du vélo", 120),
    type: body.type,
    brand: optionalText(body.brand, "La marque", 80),
    model: optionalText(body.model, "Le modèle", 120),
    gammeName: optionalText(body.gammeName, "La gamme", 120),
    lastService: body.lastService ? toDateOnly(body.lastService) : null,
    parts: parts.map((part) => ({
      id: requireNumber(part?.id, "L’identifiant de pièce est invalide.", { min: 0, integer: true }),
      name: requireText(part?.name, "Le nom de la pièce", 160),
      maxDistance: requireNumber(
        part?.maxDistance,
        "Le kilométrage maximal conseillé doit être un nombre positif.",
        { min: 0 },
      ),
      isActif: part?.isActif !== false,
    })),
  };
}

function validateRide(body) {
  return {
    id: body?.id ? requireText(body.id, "L’identifiant de la sortie", 64) : undefined,
    name: requireText(body?.name, "Le nom de la sortie", 160),
    bikeId: requireText(body?.bikeId, "Le vélo de la sortie", 64),
    date: requireText(body?.date, "La date de la sortie", 40),
    distance: requireNumber(body?.distance, "La distance doit être un nombre positif.", { min: 0 }),
  };
}

function validateReplacement(body) {
  const date = toDateOnly(body?.date);
  if (!date) {
    throw new HttpError(400, "La date de l’intervention est invalide.");
  }
  return {
    bikeId: requireText(body?.bikeId, "Le vélo sélectionné", 64),
    partId: requireNumber(body?.partId, "La pièce sélectionnée est invalide.", { min: 0, integer: true }),
    newMaxDistance: requireNumber(
      body?.newMaxDistance,
      "Le kilométrage maximal conseillé doit être supérieur à zéro.",
      { min: 0, strict: true },
    ),
    newDistance: requireNumber(
      body?.newDistance,
      "Le kilométrage de la pièce doit être un nombre positif.",
      { min: 0 },
    ),
    date,
    note: optionalText(body?.note, "La note", 500),
  };
}

module.exports = { validateBike, validateRide, validateReplacement };
