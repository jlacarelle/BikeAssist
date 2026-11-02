const sql = require("mssql");

// Lit une chaîne de connexion au format ADO.NET, celui que donne le portail Azure.
function parseConnectionString(connectionString) {
  const values = {};
  for (const part of connectionString.split(";")) {
    const separator = part.indexOf("=");
    if (separator <= 0) continue;
    const key = part.slice(0, separator).trim().toLowerCase();
    values[key] = part.slice(separator + 1).trim();
  }

  const [host, port] = (values.server ?? values["data source"] ?? "")
    .replace(/^tcp:/i, "")
    .split(",");
  const database = values["initial catalog"] ?? values.database;
  const user = values["user id"] ?? values.uid ?? values["user"];
  const password = values.password ?? values.pwd;

  if (!host || !database || !user || !password) {
    throw new Error(
      "SQL_CONNECTION_STRING est incomplète : serveur, base, utilisateur et mot de passe sont requis.",
    );
  }

  return {
    server: host,
    port: port ? Number(port) : 1433,
    database,
    user,
    password,
    options: { encrypt: true, trustServerCertificate: false },
    pool: { max: 5, min: 0, idleTimeoutMillis: 30000 },
    // La base gratuite Azure SQL se met en veille : la première connexion peut être longue.
    connectionTimeout: 60000,
    requestTimeout: 30000,
  };
}

let poolPromise = null;

function getPool() {
  if (!poolPromise) {
    const connectionString = process.env.SQL_CONNECTION_STRING;
    if (!connectionString) {
      throw new Error("SQL_CONNECTION_STRING n’est pas configurée.");
    }
    poolPromise = new sql.ConnectionPool(parseConnectionString(connectionString))
      .connect()
      .catch((error) => {
        poolPromise = null;
        throw error;
      });
  }
  return poolPromise;
}

module.exports = { sql, getPool, parseConnectionString };
