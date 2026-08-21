import { getHealth } from "./controllers/healthController.js";
import { getWeather } from "./controllers/weatherController.js";
import { getRisk } from "./controllers/riskController.js";
import { getRoute } from "./controllers/routeController.js";
import { postSafeRoute } from "./controllers/routeController.js";
import { getZones } from "./controllers/zonesController.js";
import { getShelters, getSafeShelterRoute } from "./controllers/shelterController.js";
import { getAlerts } from "./controllers/alertController.js";
import { postSensorSimulate } from "./controllers/sensorController.js";
import { sendJson, sendNotFound } from "./utils/http.js";

export async function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  const method = req.method || "GET";

  if (method === "GET" && path === "/api/health") return getHealth(req, res);
  if (method === "GET" && path === "/api/weather") return getWeather(req, res, url);
  if (method === "GET" && path === "/api/risk") return getRisk(req, res, url);
  if (method === "GET" && path === "/api/zones") return getZones(req, res, url);
  if (method === "GET" && path === "/api/route") return getRoute(req, res, url);
  if (method === "POST" && path === "/api/routes/safe") return postSafeRoute(req, res);
  if (method === "GET" && path === "/api/shelters") return getShelters(req, res, url);
  if (method === "GET" && path === "/api/shelters/safe-route") return getSafeShelterRoute(req, res, url);
  if (method === "GET" && path === "/api/alerts") return getAlerts(req, res, url);
  if (method === "POST" && path === "/api/sensors/simulate") return postSensorSimulate(req, res);

  if (path === "/") {
    return sendJson(res, 200, {
      service: "FloodGuard API",
      status: "ok",
      endpoints: ["/api/health", "/api/weather", "/api/risk", "/api/zones", "/api/route", "/api/routes/safe", "/api/shelters", "/api/shelters/safe-route", "/api/alerts", "/api/sensors/simulate"]
    });
  }

  return sendNotFound(res);
}
