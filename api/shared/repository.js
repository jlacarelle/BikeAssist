const { randomUUID } = require("crypto");
const { HttpError } = require("./http");
const { getPool, sql } = require("./db");

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Renvoie une date au format YYYY-MM-DD, sans décalage de fuseau horaire.
function toDateOnly(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const text = String(value);
  if (DATE_PATTERN.test(text.slice(0, 10))) {
    return text.slice(0, 10);
  }
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) {
    throw new HttpError(400, "Une date est invalide.");
  }
  return parsed.toISOString().slice(0, 10);
}

async function runInTransaction(work) {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  try {
    const result = await work(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback().catch(() => {});
    throw error;
  }
}

function request(transaction, inputs) {
  const req = new sql.Request(transaction);
  for (const [name, type, value] of inputs) {
    req.input(name, type, value);
  }
  return req;
}

async function getState(userId) {
  const pool = await getPool();
  const params = [["userId", sql.NVarChar(128), userId]];
  const bikeRows = (
    await request(pool, params).query(`
      SELECT id, name, type, brand, model, distance, gamme_name, added_on,
             CONVERT(char(10), last_service, 23) AS last_service
      FROM dbo.bikes WHERE user_id = @userId ORDER BY seq`)
  ).recordset;
  const partRows = (
    await request(pool, params).query(`
      SELECT bike_id, part_id, name, distance, max_distance, is_actif
      FROM dbo.bike_parts WHERE user_id = @userId ORDER BY seq`)
  ).recordset;
  const rideRows = (
    await request(pool, params).query(`
      SELECT id, name, bike_id, bike_name, date_label, distance
      FROM dbo.rides WHERE user_id = @userId ORDER BY seq`)
  ).recordset;
  const entryRows = (
    await request(pool, params).query(`
      SELECT id, bike_id, bike_name, bike_distance, part_id, part_name,
             previous_distance, new_distance,
             CONVERT(char(10), entry_date, 23) AS entry_date, note
      FROM dbo.maintenance_entries WHERE user_id = @userId ORDER BY seq DESC`)
  ).recordset;

  const bikes = bikeRows.map((row) => ({
    id: row.id,
    name: row.name,
    type: row.type,
    brand: row.brand,
    model: row.model,
    distance: row.distance,
    gammeName: row.gamme_name,
    addedOn: row.added_on.toISOString(),
    ...(row.last_service ? { lastService: row.last_service } : {}),
    parts: partRows
      .filter((part) => part.bike_id === row.id)
      .map((part) => ({
        id: part.part_id,
        name: part.name,
        distance: part.distance,
        maxDistance: part.max_distance,
        isActif: part.is_actif,
        bikeId: row.id,
      })),
  }));

  return {
    bikes,
    rides: rideRows.map((row) => ({
      id: row.id,
      name: row.name,
      bike: row.bike_name,
      bikeId: row.bike_id,
      date: row.date_label,
      distance: row.distance,
    })),
    maintenanceEntries: entryRows.map((row) => ({
      id: row.id,
      bikeId: row.bike_id,
      bikeName: row.bike_name,
      bikeDistance: row.bike_distance,
      partId: row.part_id,
      partName: row.part_name,
      previousDistance: row.previous_distance,
      newDistance: row.new_distance,
      date: row.entry_date,
      note: row.note,
    })),
  };
}

// Crée ou met à jour un vélo et remplace ses pièces.
// Les kilomètres existants sont conservés côté serveur : une fiche ouverte depuis un ancien
// onglet ne doit pas écraser les kilomètres déjà enregistrés.
async function saveBike(userId, bike) {
  await runInTransaction(async (transaction) => {
    const existing = (
      await request(transaction, [
        ["userId", sql.NVarChar(128), userId],
        ["id", sql.NVarChar(64), bike.id],
      ]).query(`
        SELECT distance FROM dbo.bikes WITH (UPDLOCK, HOLDLOCK)
        WHERE user_id = @userId AND id = @id`)
    ).recordset[0];

    const common = [
      ["userId", sql.NVarChar(128), userId],
      ["id", sql.NVarChar(64), bike.id],
      ["name", sql.NVarChar(120), bike.name],
      ["type", sql.NVarChar(20), bike.type],
      ["brand", sql.NVarChar(80), bike.brand ?? ""],
      ["model", sql.NVarChar(120), bike.model ?? ""],
      ["gammeName", sql.NVarChar(120), bike.gammeName ?? ""],
      ["lastService", sql.Char(10), toDateOnly(bike.lastService)],
    ];

    if (existing) {
      await request(transaction, common).query(`
        UPDATE dbo.bikes
        SET name = @name, type = @type, brand = @brand, model = @model,
            gamme_name = @gammeName,
            last_service = CAST(@lastService AS DATE)
        WHERE user_id = @userId AND id = @id`);
    } else {
      await request(
        transaction,
        [
          ...common,
          ["addedOn", sql.DateTime2(3), new Date()],
        ],
      ).query(`
        INSERT INTO dbo.bikes
          (user_id, id, name, type, brand, model, distance, gamme_name, added_on, last_service)
        VALUES
          (@userId, @id, @name, @type, @brand, @model, 0, @gammeName, @addedOn,
           CAST(@lastService AS DATE))`);
    }

    const previousParts = (
      await request(transaction, [
        ["userId", sql.NVarChar(128), userId],
        ["bikeId", sql.NVarChar(64), bike.id],
      ]).query(`
        SELECT part_id, distance FROM dbo.bike_parts
        WHERE user_id = @userId AND bike_id = @bikeId`)
    ).recordset;
    const previousDistances = new Map(
      previousParts.map((part) => [part.part_id, part.distance]),
    );

    await request(transaction, [
      ["userId", sql.NVarChar(128), userId],
      ["bikeId", sql.NVarChar(64), bike.id],
    ]).query(`DELETE FROM dbo.bike_parts WHERE user_id = @userId AND bike_id = @bikeId`);

    for (const part of bike.parts ?? []) {
      await request(transaction, [
        ["userId", sql.NVarChar(128), userId],
        ["bikeId", sql.NVarChar(64), bike.id],
        ["partId", sql.Int, part.id],
        ["name", sql.NVarChar(160), part.name],
        ["distance", sql.Float, previousDistances.get(part.id) ?? 0],
        ["maxDistance", sql.Float, part.maxDistance],
        ["isActif", sql.Bit, part.isActif !== false],
      ]).query(`
        INSERT INTO dbo.bike_parts
          (user_id, bike_id, part_id, name, distance, max_distance, is_actif)
        VALUES (@userId, @bikeId, @partId, @name, @distance, @maxDistance, @isActif)`);
    }
  });
}

async function deleteBike(userId, bikeId) {
  // Les pièces et sorties sont supprimées en cascade ; les entretiens sont conservés.
  await request(await getPool(), [
    ["userId", sql.NVarChar(128), userId],
    ["id", sql.NVarChar(64), bikeId],
  ]).query(`DELETE FROM dbo.bikes WHERE user_id = @userId AND id = @id`);
}

async function createRide(userId, ride) {
  await runInTransaction(async (transaction) => {
    const bike = (
      await request(transaction, [
        ["userId", sql.NVarChar(128), userId],
        ["bikeId", sql.NVarChar(64), ride.bikeId],
      ]).query(`
        SELECT name FROM dbo.bikes WITH (UPDLOCK)
        WHERE user_id = @userId AND id = @bikeId`)
    ).recordset[0];
    if (!bike) {
      throw new HttpError(404, "Le vélo sélectionné n’existe plus.");
    }

    const id = ride.id || randomUUID();
    await request(transaction, [
      ["userId", sql.NVarChar(128), userId],
      ["id", sql.NVarChar(64), id],
      ["bikeId", sql.NVarChar(64), ride.bikeId],
      ["name", sql.NVarChar(160), ride.name],
      ["bikeName", sql.NVarChar(120), bike.name],
      ["dateLabel", sql.NVarChar(40), ride.date],
      ["distance", sql.Float, ride.distance],
    ]).query(`
      INSERT INTO dbo.rides
        (user_id, id, bike_id, name, bike_name, date_label, distance)
      VALUES (@userId, @id, @bikeId, @name, @bikeName, @dateLabel, @distance)`);

    await addDistance(transaction, userId, ride.bikeId, ride.distance);
    return id;
  });
}

async function deleteRide(userId, rideId) {
  await runInTransaction(async (transaction) => {
    const ride = (
      await request(transaction, [
        ["userId", sql.NVarChar(128), userId],
        ["id", sql.NVarChar(64), rideId],
      ]).query(`
        SELECT bike_id, distance FROM dbo.rides WITH (UPDLOCK)
        WHERE user_id = @userId AND id = @id`)
    ).recordset[0];
    if (!ride) {
      return;
    }

    await request(transaction, [
      ["userId", sql.NVarChar(128), userId],
      ["id", sql.NVarChar(64), rideId],
    ]).query(`DELETE FROM dbo.rides WHERE user_id = @userId AND id = @id`);

    await addDistance(transaction, userId, ride.bike_id, -ride.distance);
  });
}

async function addDistance(transaction, userId, bikeId, distance) {
  const inputs = [
    ["userId", sql.NVarChar(128), userId],
    ["bikeId", sql.NVarChar(64), bikeId],
    ["distance", sql.Float, distance],
  ];
  await request(transaction, inputs).query(`
    UPDATE dbo.bikes SET distance = distance + @distance
    WHERE user_id = @userId AND id = @bikeId`);
  await request(transaction, inputs).query(`
    UPDATE dbo.bike_parts SET distance = distance + @distance
    WHERE user_id = @userId AND bike_id = @bikeId`);
}

async function replacePart(userId, replacement) {
  return runInTransaction(async (transaction) => {
    const row = (
      await request(transaction, [
        ["userId", sql.NVarChar(128), userId],
        ["bikeId", sql.NVarChar(64), replacement.bikeId],
        ["partId", sql.Int, replacement.partId],
      ]).query(`
        SELECT b.name AS bike_name, b.distance AS bike_distance,
               p.name AS part_name, p.distance AS part_distance
        FROM dbo.bikes b WITH (UPDLOCK)
        JOIN dbo.bike_parts p WITH (UPDLOCK)
          ON p.user_id = b.user_id AND p.bike_id = b.id
        WHERE b.user_id = @userId AND b.id = @bikeId AND p.part_id = @partId`)
    ).recordset[0];
    if (!row) {
      throw new HttpError(404, "Le vélo ou la pièce sélectionnée n’existe plus.");
    }

    await request(transaction, [
      ["userId", sql.NVarChar(128), userId],
      ["bikeId", sql.NVarChar(64), replacement.bikeId],
      ["partId", sql.Int, replacement.partId],
      ["maxDistance", sql.Float, replacement.newMaxDistance],
      ["distance", sql.Float, replacement.newDistance],
    ]).query(`
      UPDATE dbo.bike_parts
      SET max_distance = @maxDistance, distance = @distance, is_actif = 1
      WHERE user_id = @userId AND bike_id = @bikeId AND part_id = @partId`);

    const entry = {
      id: randomUUID(),
      bikeId: replacement.bikeId,
      bikeName: row.bike_name,
      bikeDistance: row.bike_distance,
      partId: replacement.partId,
      partName: row.part_name,
      previousDistance: row.part_distance,
      newDistance: replacement.newDistance,
      date: replacement.date,
      note: replacement.note,
    };

    await request(transaction, [
      ["userId", sql.NVarChar(128), userId],
      ["id", sql.NVarChar(64), entry.id],
      ["bikeId", sql.NVarChar(64), entry.bikeId],
      ["bikeName", sql.NVarChar(120), entry.bikeName],
      ["bikeDistance", sql.Float, entry.bikeDistance],
      ["partId", sql.Int, entry.partId],
      ["partName", sql.NVarChar(160), entry.partName],
      ["previousDistance", sql.Float, entry.previousDistance],
      ["newDistance", sql.Float, entry.newDistance],
      ["entryDate", sql.Char(10), entry.date],
      ["note", sql.NVarChar(500), entry.note],
    ]).query(`
      INSERT INTO dbo.maintenance_entries
        (user_id, id, bike_id, bike_name, bike_distance, part_id, part_name,
         previous_distance, new_distance, entry_date, note)
      VALUES
        (@userId, @id, @bikeId, @bikeName, @bikeDistance, @partId, @partName,
         @previousDistance, @newDistance, CAST(@entryDate AS DATE), @note)`);

    return entry;
  });
}

module.exports = {
  getState,
  saveBike,
  deleteBike,
  createRide,
  deleteRide,
  replacePart,
  toDateOnly,
};
