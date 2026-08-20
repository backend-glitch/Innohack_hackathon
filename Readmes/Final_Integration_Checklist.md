# FloodGuard AI Final Integration Checklist

Use this checklist before merging and before the demo.

## Backend

- `GET /api/health` returns a healthy status
- `GET /api/weather?lat=&lng=` works
- `GET /api/risk?lat=&lng=` works
- `GET /api/route?from=lat,lng&to=lat,lng` still works during transition
- `POST /api/routes/safe` is the preferred route endpoint
- `GET /api/shelters` works
- `GET /api/alerts?lat=&lng=` works
- `POST /api/sensors/simulate` works

## Route Contract

- Route responses include `route`, `distance_km`, `estimated_minutes`, `risk_level`, and `avoided_flood_zones`
- Route responses also keep compatibility aliases like `distance`, `estimatedTime`, and `routeType`
- Route coordinates use `[longitude, latitude]` for the public route array

## Shelter Contract

- Shelter objects include both `available` and `available_capacity`
- Shelter objects include both `lat` / `lng` and `latitude` / `longitude`
- Shelter `status` stays consistent, for example `OPEN`

## Risk Contract

- Risk payloads include `probability`, `risk`, `confidence`, `predictionWindow`, `factors`, and `recommendation`
- Risk levels stay consistent across services

## Frontend

- Frontend calls the backend only
- Frontend does not call ML directly
- Frontend uses `VITE_API_URL`
- Frontend handles demo mode if the backend is unavailable

## Demo Safety

- Demo fallback is enabled
- One service failure does not break the whole app
- The team knows which endpoint is the source of truth for each feature

## Before Merge

- Run each endpoint once with sample coordinates
- Verify JSON field names match the agreed contract
- Confirm no API keys are exposed in the frontend
- Confirm the frontend still renders after integration
