import { sendJson, sendValidationError } from "../utils/http.js";
import { demoRisk } from "../services/demoData.js";
import { parseLatLng } from "../utils/parse.js";
import { savePrediction } from "../services/store.js";

export async function getRisk(_req, res, url) {
  const coords = parseLatLng(url.searchParams);
  if (!coords.ok) return sendValidationError(res, coords.message, "INVALID_LOCATION");

  const mlUrl = process.env.ML_SERVICE_URL?.replace(/\/$/, "") || "http://localhost:8000";
  const mlPayload = buildMlPayload(coords.lat, coords.lng);

  try {
    const response = await fetch(`${mlUrl}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mlPayload)
    });

    if (!response.ok) {
      throw new Error(`ML service returned ${response.status}`);
    }

    const mlResult = await response.json();
    const payload = {
      location: { lat: coords.lat, lng: coords.lng },
      ...mlResult
    };

    await savePrediction({ lat: coords.lat, lng: coords.lng, ...payload }).catch(() => {});
    return sendJson(res, 200, payload);
  } catch (error) {
    const payload = demoRisk(coords.lat, coords.lng);
    await savePrediction({ lat: coords.lat, lng: coords.lng, ...payload }).catch(() => {});
    return sendJson(res, 200, payload);
  }
}

function buildMlPayload(lat, lng) {
  return {
    latitude: lat,
    longitude: lng,
    rainfall_1h: 35,
    rainfall_6h: 95,
    rainfall_24h: 180,
    rainfall_72h: 320,
    river_level: 6.8,
    river_level_change: 0.75,
    temperature: 27,
    humidity: 91,
    soil_moisture: 88,
    elevation: 25,
    distance_from_river: 0.8,
    forecast_rainfall_24h: 210,
    forecast_rainfall_72h: 380,
    historical_flood_frequency: 0.78
  };
}
