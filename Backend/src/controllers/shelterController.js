import { sendJson } from "../utils/http.js";
import { demoShelters } from "../services/demoData.js";
import { parseLatLng } from "../utils/parse.js";
import { saveShelter } from "../services/store.js";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const routingService = require("../../../Router/Services/routingservice");

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

export async function getSafeShelterRoute(_req, res, url) {
  const coords = parseLatLng(url.searchParams);
  if (!coords.ok) {
    return sendJson(res, 400, {
      success: false,
      error: { code: "INVALID_LOCATION", message: coords.message }
    });
  }

  const result = routingService.findNearestSafeShelter({ lat: coords.lat, lng: coords.lng });
  if (!result) {
    return sendJson(res, 503, {
      success: false,
      error: {
        code: "ROUTING_SERVICE_UNAVAILABLE",
        message: "Safe shelter routing is temporarily unavailable."
      }
    });
  }

  return sendJson(res, 200, {
    shelter: {
      id: result.shelter.id,
      name: result.shelter.name,
      lat: result.shelter.latitude,
      lng: result.shelter.longitude,
      capacity: result.shelter.capacity,
      available: result.shelter.available_capacity,
      available_capacity: result.shelter.available_capacity,
      status: result.shelter.status
    },
    route: result.route,
    distance_km: result.distance_km,
    estimated_minutes: result.estimated_minutes,
    risk_level: result.risk_level,
    routing_cost: result.routing_cost
  });
}
