# FloodGuard AI ML API

This folder contains the INDOFLOODS event-level flood severity classifier and the API service that exposes it.

## Model purpose

The model predicts the probability of `Severe Flood` for an INDOFLOODS flood event. It is a flood-severity classifier, not a general flood-occurrence forecaster.

## Dataset

The model was trained from:

- `ml/data/processed/flood_severity_dataset.csv`

The target is:

- `Flood Type` encoded as `Flood = 0` and `Severe Flood = 1`

## Scientifically safer model choice

The API uses the ablated B/C feature set, which excludes:

- `Danger Level`
- `Warning Level`
- all previously excluded post-event or outcome variables

This is the safer option because `Danger Level` is closely tied to the label definition.

## Validation performance

On the gauge-disjoint validation split used in the ablation and threshold work, the ablated model achieved:

- Accuracy: `0.7099` at the default `0.50` cutoff
- Severe Flood precision: `0.6356`
- Severe Flood recall: `0.4400`
- Severe Flood F1: `0.5200`
- ROC-AUC: `0.710446`

For the API warning threshold of `0.45`, the same validation split gave:

- Accuracy: `0.7055`
- Severe Flood precision: `0.6092`
- Severe Flood recall: `0.4892`
- Severe Flood F1: `0.5427`

## API artifacts

The API uses the clean B/C artifacts:

- `ml/models/flood_model_clean.pkl`
- `ml/models/preprocessor_clean.pkl`

If the clean artifacts cannot be loaded and `DEMO_MODE=true`, the service returns deterministic demo predictions instead.

## Threshold

The operational Severe Flood threshold is:

- `0.45`

At probability `>= 0.45`, the service treats the event as Severe Flood for the internal decision logic.

This threshold is an operational warning cutoff for the classifier output. It is not a calibrated physical flood-arrival probability.

## API

Run the service from `ml/` with:

```bash
uvicorn app.main:app --reload --port 8000
```

Swagger is available at:

- `http://localhost:8000/docs`

Health check:

- `GET /health`

Prediction:

- `POST /predict`

The response always contains exactly:

```json
{
  "risk_score": 0,
  "risk_level": "LOW",
  "confidence": 0.0,
  "prediction_window_hours": 72,
  "factors": []
}
```

The standard response intentionally keeps `factors` empty in normal mode because the current clean model does not have a defensible per-request mapping from the user's weather inputs into meaningful hydrologic model features. The service refuses to present latitude/longitude as causal flood factors.

## DEMO_MODE

Set `DEMO_MODE=true` to enable deterministic demo predictions.

Use demo mode when:

- the clean model files are unavailable
- you want the API to demonstrate LOW, MODERATE, HIGH, and CRITICAL behavior from the request inputs

In demo mode, the service does not claim scientific flood forecasting performance.

## Feature adapter

The inbound API contract includes weather and hydrology fields that are not directly present in the INDOFLOODS training feature set.

The adapter only maps the fields that are defensible for the trained model:

- `latitude` -> `Latitude`
- `longitude` -> `Longitude`

All other trained features are filled from the saved training medians rather than being invented from the request payload.

This is documented because the trained INDOFLOODS model does not scientifically support a direct conversion from fields like `rainfall_1h`, `river_level_change`, or `soil_moisture` to the original training features.

In normal mode, the service therefore does not surface generic feature-importance explanations as user-facing flood factors.

## Confidence

Confidence is computed as the probability assigned to the selected class:

- if `probability_of_Severe_Flood >= 0.45`, confidence = `probability_of_Severe_Flood`
- otherwise confidence = `1 - probability_of_Severe_Flood`

This yields a value between `0.0` and `1.0`.

Risk score is computed as:

- `risk_score = round(probability_of_Severe_Flood * 100)`

Then the score is converted to a label with:

- `0-29` `LOW`
- `30-59` `MODERATE`
- `60-79` `HIGH`
- `80-100` `CRITICAL`

## Limitations

- This is an INDOFLOODS event-level flood severity classifier, not a validated real-world operational flood forecast system.
- The API request contract is broader than the model's native feature set, so only a small subset of the request can be mapped defensibly.
- The current model does not predict physical flood arrival time; `prediction_window_hours` is fixed at `72` for API consistency.
- A local FastAPI compatibility shim is retained in `ml/fastapi/` because the installed FastAPI target in this workspace resolved to an unreadable/empty namespace package, so the real package could not be verified as usable here.

## How Member 4 should call `/predict`

Example:

```bash
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d "{\"latitude\":12.97,\"longitude\":79.15,\"rainfall_1h\":20,\"rainfall_6h\":65,\"rainfall_24h\":128,\"rainfall_72h\":210,\"river_level\":4.8,\"river_level_change\":0.35,\"temperature\":27,\"humidity\":89,\"soil_moisture\":82,\"elevation\":18,\"distance_from_river\":1.2,\"forecast_rainfall_24h\":145,\"forecast_rainfall_72h\":280,\"historical_flood_frequency\":0.62}"
```

## Clean model files

The clean API-ready model files are created and saved under `ml/models/` and should be used instead of the earlier proxy-rich artifact.
