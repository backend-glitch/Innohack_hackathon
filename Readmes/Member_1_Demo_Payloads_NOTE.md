# Member 1 Demo Payloads Note

Use [Member_1_Demo_Payloads.json](./Member_1_Demo_Payloads.json) to test the ML `/predict` endpoint during integration.

## What this file contains

- 4 demo cases: `LOW`, `MODERATE`, `HIGH`, and `CRITICAL`
- The final ML request shape expected by the backend
- The response fields the backend/frontend should rely on

## Expected ML response fields

- `risk_score`
- `risk_level`
- `confidence`
- `prediction_window_hours`
- `factors`

## Important notes

- Keep the request field names exactly as written in the JSON file.
- Do not rename `risk_level` to `risk` or `risk_score` to `probability`.
- `MODERATE` is the valid ML enum value, not `MEDIUM`.
- This file is for demo/integration testing, not production data generation.
