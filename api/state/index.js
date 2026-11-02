const { getUserId, sendError, sendJson } = require("../shared/http");
const { getState } = require("../shared/repository");

module.exports = async function (context, req) {
  try {
    const userId = getUserId(req);
    sendJson(context, 200, await getState(userId));
  } catch (error) {
    sendError(context, error);
  }
};
