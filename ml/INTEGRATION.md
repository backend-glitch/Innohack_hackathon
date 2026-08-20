# FloodGuard ML Integration Guide

This document contains only the information needed for the backend to call the ML service.

## 1. ML service URL

`http://localhost:8000`

## 2. Endpoint

`POST /predict`

## 3. Required request JSON

Send all current API-contract fields exactly as shown below:

```json
{
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
  "historical_flood_frequency": 0.62
}
```

## 4. Exact response JSON fields

The response contains exactly these fields:

- `risk_score`
- `risk_level`
- `confidence`
- `prediction_window_hours`
- `factors`

## 5. Example curl request

```bash
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d "{\"latitude\":12.97,\"longitude\":79.15,\"rainfall_1h\":20,\"rainfall_6h\":65,\"rainfall_24h\":128,\"rainfall_72h\":210,\"river_level\":4.8,\"river_level_change\":0.35,\"temperature\":27,\"humidity\":89,\"soil_moisture\":82,\"elevation\":18,\"distance_from_river\":1.2,\"forecast_rainfall_24h\":145,\"forecast_rainfall_72h\":280,\"historical_flood_frequency\":0.62}"
```

## 6. Example successful response

```json
{
  "risk_score": 30,
  "risk_level": "MODERATE",
  "confidence": 0.7006,
  "prediction_window_hours": 72,
  "factors": []
}
```

## 7. DEMO_MODE configuration

Set `DEMO_MODE=true` before starting the service to enable deterministic demo predictions.

Demo mode is useful when the clean model files are unavailable or when you want predictable LOW, MODERATE, HIGH, and CRITICAL outputs for testing.

## 8. How to start the service

Run the service from the `ml/` directory:

```bash
uvicorn app.main:app --reload --port 8000
```

## 9. Validation and error behavior

- `latitude` must be between `-90` and `90`
- `longitude` must be between `-180` and `180`
- rainfall fields must be non-negative
- `humidity` must be between `0` and `100`
- `soil_moisture` must be between `0` and `100`
- `elevation` must be non-negative

Invalid requests return HTTP `422`.

## 10. Important model limitations

- The service is an INDOFLOODS event-level flood severity classifier, not a validated real-world flood-occurrence forecasting system.
- It predicts the probability of `Severe Flood`, not a physical flood arrival time.
- `prediction_window_hours` is fixed at `72` for API consistency.
- The current normal-mode response does not expose causal flood factors; `factors` is intentionally empty because the request contract does not map defensibly to the trained features.
- `risk_score` is derived from model probability by `round(probability * 100)` and is not a calibrated physical flood-risk probability.
- `confidence` is computed as the selected-class probability: if `probability >= 0.45`, confidence is `probability`; otherwise confidence is `1 - probability`.

