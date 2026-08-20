import { sendJson, sendValidationError } from "../utils/http.js";
import { demoRoute } from "../services/demoData.js";
import { parseRouteEndpoints } from "../utils/parse.js";

export function getRoute(_req, res, url) {
  const coords = parseRouteEndpoints(url.searchParams);
  if (!coords.ok) return sendValidationError(res, coords.message, "INVALID_ROUTE");
  return sendJson(res, 200, demoRoute(coords.from, coords.to));
}
