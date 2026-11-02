const { getUserId, sendError, sendJson } = require("../shared/http");
const { replacePart } = require("../shared/repository");
const { validateReplacement } = require("../shared/validation");

module.exports = async function (context, req) {
  try {
    const userId = getUserId(req);
    const replacement = validateReplacement(req.body);
    const entry = await replacePart(userId, replacement);
    sendJson(context, 201, entry);
  } catch (error) {
    sendError(context, error);
  }
};
