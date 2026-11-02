class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Static Web Apps transmet l'identité de l'utilisateur connecté dans cet en-tête (JSON encodé en base64).
function getUserId(req) {
  const header = req.headers?.["x-ms-client-principal"];
  if (!header) {
    throw new HttpError(401, "Connexion requise.");
  }
  const principal = JSON.parse(Buffer.from(header, "base64").toString("utf8"));
  if (!principal.userId) {
    throw new HttpError(401, "Connexion requise.");
  }
  return principal.userId;
}

function sendJson(context, status, body) {
  context.res = {
    status,
    headers: { "Content-Type": "application/json" },
    body,
  };
}

function sendError(context, error) {
  if (error instanceof HttpError) {
    sendJson(context, error.status, { error: error.message });
    return;
  }
  context.log.error(error);
  sendJson(context, 500, { error: "Une erreur est survenue côté serveur." });
}

module.exports = { HttpError, getUserId, sendJson, sendError };
