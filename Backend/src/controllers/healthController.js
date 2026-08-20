import { sendJson } from "../utils/http.js";

export function getHealth(_req, res) {
  return sendJson(res, 200, {
    status: "ok",
    service: "FloodGuard API",
    timestamp: new Date().toISOString()
  });
}
