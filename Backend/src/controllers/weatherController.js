import { sendJson, sendValidationError } from "../utils/http.js";
import { demoWeather } from "../services/demoData.js";
import { parseLatLng } from "../utils/parse.js";
import { saveWeather } from "../services/store.js";

export async function getWeather(_req, res, url) {
  const coords = parseLatLng(url.searchParams);
  if (!coords.ok) return sendValidationError(res, coords.message, "INVALID_LOCATION");
  const payload = demoWeather(coords.lat, coords.lng);
  await saveWeather(payload.location ? { ...payload.location, ...payload } : payload).catch(() => {});
  return sendJson(res, 200, payload);
}
