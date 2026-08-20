import { sendJson, sendValidationError } from "../utils/http.js";
import { demoZones } from "../services/demoData.js";
import { parseLatLng } from "../utils/parse.js";
import { saveFloodZone } from "../services/store.js";

export async function getZones(_req, res, url) {
  const coords = parseLatLng(url.searchParams);
  if (!coords.ok) return sendValidationError(res, coords.message, "INVALID_LOCATION");

  const payload = demoZones(coords.lat, coords.lng);
  await Promise.all(
    payload.zones.map((zone) =>
      saveFloodZone({
        zoneId: zone.id,
        riskScore: zone.risk_score,
        riskLevel: zone.risk_level,
        polygon: zone.polygon
      })
    )
  ).catch(() => {});

  return sendJson(res, 200, payload);
}
