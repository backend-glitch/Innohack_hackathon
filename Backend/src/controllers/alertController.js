import { sendJson, sendValidationError } from "../utils/http.js";
import { demoAlert } from "../services/demoData.js";
import { parseLatLng } from "../utils/parse.js";
import { saveAlert } from "../services/store.js";

export async function getAlerts(_req, res, url) {
  const coords = parseLatLng(url.searchParams);
  if (!coords.ok) return sendValidationError(res, coords.message, "INVALID_LOCATION");
  const payload = demoAlert(coords.lat, coords.lng);
  const alert = payload.alert;
  await saveAlert({
    location: alert.location ? String(alert.location) : "Unknown",
    lat: coords.lat,
    lng: coords.lng,
    riskLevel: alert.level,
    title: alert.title,
    message: alert.message,
    probability: alert.probability,
    recommendedAction: alert.recommendedAction
  }).catch(() => {});
  return sendJson(res, 200, payload);
}
