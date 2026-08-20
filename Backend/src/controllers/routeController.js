import { sendJson, sendValidationError } from "../utils/http.js";
import { parseRouteEndpoints } from "../utils/parse.js";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const routingService = require("../../../Router/Services/routingservice");

export function getRoute(_req, res, url) {
  const coords = parseRouteEndpoints(url.searchParams);
  if (!coords.ok) return sendValidationError(res, coords.message, "INVALID_ROUTE");
  return sendJson(res, 200, formatRouteResponse(routingService.calculateRoute(coords.from, coords.to), coords.from, coords.to));
}

export async function postSafeRoute(req, res) {
  const body = await readBody(req);
  const coords = parseRouteBody(body);
  if (!coords.ok) return sendValidationError(res, coords.message, "INVALID_ROUTE");
  return sendJson(res, 200, formatRouteResponse(routingService.calculateRoute(coords.from, coords.to), coords.from, coords.to));
}

function formatRouteResponse(result, from, to) {
  if (!result || result.success === false) {
    return {
      success: false,
      error: {
        code: "ROUTING_SERVICE_UNAVAILABLE",
        message: result?.message || "Safe routing service is temporarily unavailable."
      }
    };
  }

  const riskMap = {
    LOW: "LOW",
    MODERATE: "MEDIUM",
    HIGH: "HIGH",
    CRITICAL: "CRITICAL"
  };
  const route = (result.route || []).map((point) => [point.lng, point.lat]);
  const distance = result.distance_km;
  const estimatedTime = result.estimated_minutes;
  const risk = riskMap[result.risk_level] || result.risk_level || "LOW";
  const avoidedFloodZones = result.avoided_flood_zones ?? 0;

  return {
    safe: true,
    risk,
    distance,
    estimatedTime,
    riskAvoided: 0.82,
    routeType: "SAFE_ALTERNATIVE",
    route,
    distance_km: distance,
    estimated_minutes: estimatedTime,
    risk_level: risk,
    avoided_flood_zones: avoidedFloodZones,
    origin: from,
    destination: to
  };
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString("utf8");
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

function parseRouteBody(body) {
  const origin = body?.origin;
  const destination = body?.destination;
  if (!origin || !destination) {
    return { ok: false, message: "origin and destination are required." };
  }

  const fromLat = Number(origin.lat);
  const fromLng = Number(origin.lng);
  const toLat = Number(destination.lat);
  const toLng = Number(destination.lng);

  if (![fromLat, fromLng, toLat, toLng].every(Number.isFinite)) {
    return { ok: false, message: "origin and destination must include valid lat and lng values." };
  }

  return {
    ok: true,
    from: { lat: fromLat, lng: fromLng },
    to: { lat: toLat, lng: toLng }
  };
}
