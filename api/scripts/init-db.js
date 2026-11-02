// Applique api/sql/schema.sql sur la base définie par SQL_CONNECTION_STRING.
// Usage : SQL_CONNECTION_STRING="..." npm run db:init (depuis le dossier api/)
const fs = require("fs");
const path = require("path");
const { getPool, sql } = require("../shared/db");

async function main() {
  const schemaPath = path.join(__dirname, "..", "sql", "schema.sql");
  const batches = fs
    .readFileSync(schemaPath, "utf8")
    .split(/^\s*GO\s*$/im)
    .map((batch) => batch.trim())
    .filter(Boolean);

  const pool = await getPool();
  for (const batch of batches) {
    await pool.request().batch(batch);
  }
  console.log(`Schéma appliqué (${batches.length} lots).`);
  await pool.close();
}

main().catch(async (error) => {
  console.error("Échec de l’initialisation :", error.message);
  process.exitCode = 1;
  await sql.close().catch(() => {});
});
