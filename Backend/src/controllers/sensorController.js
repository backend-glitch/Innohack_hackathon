import { sendJson } from "../utils/http.js";
import { demoSensorReading } from "../services/demoData.js";
import { saveSensor } from "../services/store.js";

export async function postSensorSimulate(req, res) {
  const body = await readBody(req);
  const payload = demoSensorReading(body);
  await saveSensor({
    sensorId: payload.sensor_id,
    rainfall: payload.rainfall,
    riverLevel: payload.river_level,
    riverLevelChange: payload.river_level_change,
    soilMoisture: payload.soil_moisture,
    riskLevel: payload.risk_level
  }).catch(() => {});
  return sendJson(res, 200, payload);
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
