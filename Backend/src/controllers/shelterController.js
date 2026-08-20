import { sendJson } from "../utils/http.js";
import { demoShelters } from "../services/demoData.js";
import { parseLatLng } from "../utils/parse.js";
import { saveShelter } from "../services/store.js";

export async function getShelters(_req, res, url) {
  const lat = url.searchParams.get("lat");
  const lng = url.searchParams.get("lng");
  if ((lat || lng) && (!lat || !lng)) {
    return sendJson(res, 400, {
      success: false,
      error: { code: "INVALID_LOCATION", message: "Latitude and longitude are required." }
    });
  }
  const coords = lat && lng ? parseLatLng(url.searchParams) : { ok: true, lat: null, lng: null };
  if (!coords.ok) return sendJson(res, 400, { success: false, error: { code: "INVALID_LOCATION", message: coords.message } });
  const shelters = demoShelters(coords.lat, coords.lng);
  await Promise.all(
    shelters.map((shelter) => saveShelter({ name: shelter.name, lat: shelter.lat, lng: shelter.lng, capacity: shelter.capacity, available: shelter.available, status: shelter.status }))
  ).catch(() => {});
  return sendJson(res, 200, { shelters });
}
