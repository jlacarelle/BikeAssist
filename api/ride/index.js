const { getUserId, sendError, sendJson, HttpError } = require("../shared/http");
const { deleteRide } = require("../shared/repository");

module.exports = async function (context, req) {
  try {
    const userId = getUserId(req);
    const rideId = context.bindingData.id;
    if (!rideId) {
      throw new HttpError(400, "L’identifiant de la sortie est obligatoire.");
    }
    await deleteRide(userId, rideId);
    sendJson(context, 204);
  } catch (error) {
    sendError(context, error);
  }
};
