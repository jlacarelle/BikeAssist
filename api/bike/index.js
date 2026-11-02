const { getUserId, sendError, sendJson } = require("../shared/http");
const { deleteBike, saveBike } = require("../shared/repository");
const { validateBike } = require("../shared/validation");

module.exports = async function (context, req) {
  try {
    const userId = getUserId(req);
    const bikeId = context.bindingData.id;

    if (req.method === "DELETE") {
      await deleteBike(userId, bikeId);
      sendJson(context, 204);
      return;
    }

    const bike = validateBike(req.body, bikeId);
    await saveBike(userId, bike);
    sendJson(context, 204);
  } catch (error) {
    sendError(context, error);
  }
};
