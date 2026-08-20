"""FastAPI entrypoint for the FloodGuard ML service."""

from __future__ import annotations

import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
from fastapi import FastAPI, HTTPException

from .explain import explain_prediction
from .model import load_clean_bundle, predict_probability
from .preprocessing import (
    adapt_request_to_features,
    confidence_from_probability,
    demo_probability,
    risk_level_from_score,
    risk_score_from_probability,
)
from .schemas import FloodPredictRequest, FloodPredictResponse

DEMO_MODE = os.getenv("DEMO_MODE", "false").strip().lower() in {"1", "true", "yes", "on"}

app = FastAPI(
    title="FloodGuard AI ML API",
    description="INDOFLOODS event-level flood severity classifier exposed through a standardized FloodGuard ML API.",
    version="1.0.0",
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/predict", response_model=FloodPredictResponse)
def predict(payload: dict) -> FloodPredictResponse:
    request = FloodPredictRequest.model_validate(payload)
    if DEMO_MODE:
        probability = demo_probability(request)
        risk_score = risk_score_from_probability(probability)
        factors = explain_prediction(
            request=request,
            adapted_frame=None,  # type: ignore[arg-type]
            booster=None,
            feature_columns=[],
            medians={},
            demo_mode=True,
        )
        return FloodPredictResponse(
            risk_score=risk_score,
            risk_level=risk_level_from_score(risk_score),
            confidence=confidence_from_probability(probability, threshold=0.45),
            prediction_window_hours=72,
            factors=factors,
        )

    try:
        bundle = load_clean_bundle()
    except Exception as exc:  # pragma: no cover - startup/runtime safety
        raise HTTPException(status_code=503, detail=f"Clean model could not be loaded: {exc}") from exc

    adapter = adapt_request_to_features(
        request=request,
        feature_columns=bundle.preprocessor["feature_columns"],
        medians=bundle.preprocessor["medians"],
    )
    probability = predict_probability(bundle, adapter.frame)
    risk_score = risk_score_from_probability(probability)
    factors = explain_prediction(
        request=request,
        adapted_frame=adapter.frame,
        booster=bundle.booster,
        feature_columns=bundle.preprocessor["feature_columns"],
        medians=bundle.preprocessor["medians"],
        demo_mode=False,
    )
    return FloodPredictResponse(
        risk_score=risk_score,
        risk_level=risk_level_from_score(risk_score),
        confidence=confidence_from_probability(probability, threshold=float(bundle.preprocessor.get("threshold", 0.45))),
        prediction_window_hours=72,
        factors=factors,
    )
