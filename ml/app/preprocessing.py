"""Feature adapter and scoring helpers for the FloodGuard ML API."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import numpy as np
import pandas as pd

from .schemas import FloodPredictRequest

RISK_LEVELS = (
    (0, 29, "LOW"),
    (30, 59, "MODERATE"),
    (60, 79, "HIGH"),
    (80, 100, "CRITICAL"),
)

API_REQUEST_FIELDS = (
    "latitude",
    "longitude",
    "rainfall_1h",
    "rainfall_6h",
    "rainfall_24h",
    "rainfall_72h",
    "river_level",
    "river_level_change",
    "temperature",
    "humidity",
    "soil_moisture",
    "elevation",
    "distance_from_river",
    "forecast_rainfall_24h",
    "forecast_rainfall_72h",
    "historical_flood_frequency",
)

DIRECT_FEATURE_MAP = {
    "Latitude": "latitude",
    "Longitude": "longitude",
}


@dataclass(frozen=True)
class AdaptationResult:
    frame: pd.DataFrame
    mapped_features: list[str]
    ignored_request_fields: list[str]


def risk_level_from_score(risk_score: int) -> str:
    for low, high, label in RISK_LEVELS:
        if low <= risk_score <= high:
            return label
    return "CRITICAL"


def confidence_from_probability(probability: float, threshold: float = 0.45) -> float:
    selected_probability = probability if probability >= threshold else 1.0 - probability
    return round(float(np.clip(selected_probability, 0.0, 1.0)), 4)


def risk_score_from_probability(probability: float) -> int:
    return int(np.clip(np.rint(probability * 100.0), 0, 100))


def classify_severe_flood(probability: float, threshold: float = 0.45) -> bool:
    return probability >= threshold


def adapt_request_to_features(
    request: FloodPredictRequest,
    feature_columns: list[str],
    medians: dict[str, Any],
) -> AdaptationResult:
    """Map only defensible fields and fall back to training medians for the rest."""

    values = {name: float(medians.get(name, 0.0)) for name in feature_columns}
    mapped_features: list[str] = []
    for feature_name, request_name in DIRECT_FEATURE_MAP.items():
        if feature_name in values:
            values[feature_name] = float(getattr(request, request_name))
            mapped_features.append(feature_name)

    ignored_request_fields = [field for field in API_REQUEST_FIELDS if field not in {DIRECT_FEATURE_MAP["Latitude"], DIRECT_FEATURE_MAP["Longitude"]}]
    frame = pd.DataFrame([values], columns=feature_columns)
    return AdaptationResult(frame=frame, mapped_features=mapped_features, ignored_request_fields=ignored_request_fields)


def demo_probability(request: FloodPredictRequest) -> float:
    """Deterministic demo-only probability generator."""

    severity_score = (
        0.02 * request.rainfall_1h
        + 0.03 * request.rainfall_6h
        + 0.04 * request.rainfall_24h
        + 0.05 * request.rainfall_72h
        + 2.50 * request.river_level
        + 4.00 * max(request.river_level_change, 0.0)
        + 50.0 * request.historical_flood_frequency
    )
    if severity_score < 10.0:
        probability = 0.15
    elif severity_score < 30.0:
        probability = 0.40
    elif severity_score < 70.0:
        probability = 0.70
    else:
        probability = 0.92
    return float(np.clip(probability, 0.01, 0.99))


def demo_factors(request: FloodPredictRequest) -> list[dict[str, float]]:
    contributions = [
        ("Rainfall 72h", 0.05 * request.rainfall_72h),
        ("Rainfall 24h", 0.04 * request.rainfall_24h),
        ("Rainfall 6h", 0.03 * request.rainfall_6h),
        ("Rainfall 1h", 0.02 * request.rainfall_1h),
        ("River level", 2.50 * request.river_level),
        ("River level change", 4.00 * max(request.river_level_change, 0.0)),
        ("Historical flood frequency", 50.0 * request.historical_flood_frequency),
    ]
    total = sum(value for _, value in contributions) or 1.0
    ranked = sorted(contributions, key=lambda item: item[1], reverse=True)
    return [
        {"name": name, "impact": round(float(value / total), 4)}
        for name, value in ranked[:5]
        if value > 0
    ]
