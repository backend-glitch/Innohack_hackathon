import { sendJson, sendValidationError } from "../utils/http.js";
import { demoRisk } from "../services/demoData.js";
import { parseLatLng } from "../utils/parse.js";
import { savePrediction } from "../services/store.js";

export async function getRisk(_req, res, url) {
  const coords = parseLatLng(url.searchParams);
  if (!coords.ok) return sendValidationError(res, coords.message, "INVALID_LOCATION");
  const payload = demoRisk(coords.lat, coords.lng);
  await savePrediction({ lat: coords.lat, lng: coords.lng, ...payload }).catch(() => {});
  return sendJson(res, 200, payload);
}
