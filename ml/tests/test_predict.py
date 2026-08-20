from __future__ import annotations

import importlib
import os
import sys
import unittest
from pathlib import Path
import asyncio
import json

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

BASE_PAYLOAD = {
    "latitude": 12.97,
    "longitude": 79.15,
    "rainfall_1h": 20,
    "rainfall_6h": 65,
    "rainfall_24h": 128,
    "rainfall_72h": 210,
    "river_level": 4.8,
    "river_level_change": 0.35,
    "temperature": 27,
    "humidity": 89,
    "soil_moisture": 82,
    "elevation": 18,
    "distance_from_river": 1.2,
    "forecast_rainfall_24h": 145,
    "forecast_rainfall_72h": 280,
    "historical_flood_frequency": 0.62,
}


def load_app(demo_mode: bool):
    os.environ["DEMO_MODE"] = "true" if demo_mode else "false"
    import app.main as app_main

    importlib.reload(app_main)
    return app_main.app


def call_json(app, method: str, path: str, payload: dict | None = None):
    body = b"" if payload is None else json.dumps(payload).encode("utf-8")
    consumed = False
    messages: list[dict] = []

    async def receive():
        nonlocal consumed
        if consumed:
            return {"type": "http.disconnect"}
        consumed = True
        return {"type": "http.request", "body": body, "more_body": False}

    async def send(message):
        messages.append(message)

    scope = {
        "type": "http",
        "method": method.upper(),
        "path": path,
        "headers": [(b"content-type", b"application/json")] if payload is not None else [],
    }
    asyncio.run(app(scope, receive, send))
    status = next(message["status"] for message in messages if message["type"] == "http.response.start")
    response_body = next(message["body"] for message in messages if message["type"] == "http.response.body")
    parsed = json.loads(response_body.decode("utf-8"))
    return status, parsed


class PredictApiTests(unittest.TestCase):
    def test_health(self) -> None:
        app = load_app(demo_mode=False)
        status, body = call_json(app, "GET", "/health")
        self.assertEqual(status, 200)
        self.assertEqual(body, {"status": "ok"})

    def test_risk_mapping_helpers(self) -> None:
        from app.preprocessing import classify_severe_flood, risk_level_from_score, risk_score_from_probability

        self.assertEqual(risk_score_from_probability(0.0), 0)
        self.assertEqual(risk_score_from_probability(0.449), 45)
        self.assertEqual(risk_score_from_probability(0.455), 46)
        self.assertEqual(risk_level_from_score(0), "LOW")
        self.assertEqual(risk_level_from_score(29), "LOW")
        self.assertEqual(risk_level_from_score(30), "MODERATE")
        self.assertEqual(risk_level_from_score(59), "MODERATE")
        self.assertEqual(risk_level_from_score(60), "HIGH")
        self.assertEqual(risk_level_from_score(79), "HIGH")
        self.assertEqual(risk_level_from_score(80), "CRITICAL")
        self.assertFalse(classify_severe_flood(0.4499))
        self.assertTrue(classify_severe_flood(0.45))

    def test_normal_weather(self) -> None:
        app = load_app(demo_mode=False)
        payload = dict(BASE_PAYLOAD)
        payload.update({"rainfall_24h": 2, "rainfall_72h": 4, "forecast_rainfall_24h": 5, "forecast_rainfall_72h": 8, "river_level": 0.8})
        status, body = call_json(app, "POST", "/predict", payload)
        self.assertEqual(status, 200)
        self.assertEqual(set(body.keys()), {"risk_score", "risk_level", "confidence", "prediction_window_hours", "factors"})
        self.assertEqual(body["factors"], [])

    def test_heavy_rainfall(self) -> None:
        app = load_app(demo_mode=False)
        payload = dict(BASE_PAYLOAD)
        payload.update({"rainfall_1h": 85, "rainfall_6h": 160, "rainfall_24h": 240, "rainfall_72h": 420, "forecast_rainfall_24h": 280, "forecast_rainfall_72h": 520})
        status, body = call_json(app, "POST", "/predict", payload)
        self.assertEqual(status, 200)
        self.assertEqual(set(body.keys()), {"risk_score", "risk_level", "confidence", "prediction_window_hours", "factors"})
        self.assertEqual(body["factors"], [])

    def test_heavy_rainfall_plus_rising_river(self) -> None:
        app = load_app(demo_mode=False)
        payload = dict(BASE_PAYLOAD)
        payload.update({"rainfall_1h": 90, "rainfall_6h": 170, "rainfall_24h": 260, "rainfall_72h": 500, "river_level": 7.9, "river_level_change": 1.4})
        status, body = call_json(app, "POST", "/predict", payload)
        self.assertEqual(status, 200)
        self.assertEqual(set(body.keys()), {"risk_score", "risk_level", "confidence", "prediction_window_hours", "factors"})
        self.assertEqual(body["factors"], [])

    def test_missing_required_field(self) -> None:
        app = load_app(demo_mode=False)
        payload = dict(BASE_PAYLOAD)
        payload.pop("latitude")
        status, _ = call_json(app, "POST", "/predict", payload)
        self.assertEqual(status, 422)

    def test_invalid_latitude(self) -> None:
        app = load_app(demo_mode=False)
        payload = dict(BASE_PAYLOAD)
        payload["latitude"] = 200
        status, _ = call_json(app, "POST", "/predict", payload)
        self.assertEqual(status, 422)

    def test_invalid_humidity(self) -> None:
        app = load_app(demo_mode=False)
        payload = dict(BASE_PAYLOAD)
        payload["humidity"] = 130
        status, _ = call_json(app, "POST", "/predict", payload)
        self.assertEqual(status, 422)

    def test_demo_mode_behavior(self) -> None:
        app = load_app(demo_mode=True)

        low = dict(BASE_PAYLOAD)
        low.update({"rainfall_1h": 0, "rainfall_6h": 2, "rainfall_24h": 3, "rainfall_72h": 5, "river_level": 0.2, "river_level_change": 0.0, "historical_flood_frequency": 0.02})

        moderate = dict(BASE_PAYLOAD)
        moderate.update({"rainfall_1h": 5, "rainfall_6h": 15, "rainfall_24h": 30, "rainfall_72h": 45, "river_level": 1.5, "river_level_change": 0.2, "historical_flood_frequency": 0.20})

        high = dict(BASE_PAYLOAD)
        high.update({"rainfall_1h": 20, "rainfall_6h": 45, "rainfall_24h": 90, "rainfall_72h": 130, "river_level": 3.5, "river_level_change": 0.5, "historical_flood_frequency": 0.45})

        critical = dict(BASE_PAYLOAD)
        critical.update({"rainfall_1h": 80, "rainfall_6h": 180, "rainfall_24h": 260, "rainfall_72h": 420, "river_level": 8.5, "river_level_change": 1.7, "historical_flood_frequency": 0.90})

        responses = [call_json(app, "POST", "/predict", payload) for payload in (low, moderate, high, critical)]
        self.assertTrue(all(status == 200 for status, _ in responses))
        levels = [body["risk_level"] for _, body in responses]
        scores = [body["risk_score"] for _, body in responses]
        self.assertEqual(levels, ["LOW", "MODERATE", "HIGH", "CRITICAL"])
        self.assertTrue(scores[0] < scores[1] < scores[2] < scores[3])
        self.assertTrue(all(body["factors"] for _, body in responses))


if __name__ == "__main__":
    unittest.main()
