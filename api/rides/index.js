const { getUserId, sendError, sendJson } = require("../shared/http");
const { createRide } = require("../shared/repository");
const { validateRide } = require("../shared/validation");

module.exports = async function (context, req) {
  try {
    const userId = getUserId(req);
    const ride = validateRide(req.body);
    await createRide(userId, ride);
    sendJson(context, 204);
  } catch (error) {
    sendError(context, error);
  }
};
