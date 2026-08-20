"""Pydantic request and response schemas for the FloodGuard ML API."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class FloodPredictRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    rainfall_1h: float = Field(..., ge=0.0)
    rainfall_6h: float = Field(..., ge=0.0)
    rainfall_24h: float = Field(..., ge=0.0)
    rainfall_72h: float = Field(..., ge=0.0)
    river_level: float = Field(..., ge=0.0)
    river_level_change: float
    temperature: float
    humidity: float = Field(..., ge=0.0, le=100.0)
    soil_moisture: float = Field(..., ge=0.0, le=100.0)
    elevation: float = Field(..., ge=0.0)
    distance_from_river: float = Field(..., ge=0.0)
    forecast_rainfall_24h: float = Field(..., ge=0.0)
    forecast_rainfall_72h: float = Field(..., ge=0.0)
    historical_flood_frequency: float = Field(..., ge=0.0, le=1.0)


class FloodFactor(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str
    impact: float


class FloodPredictResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    risk_score: int
    risk_level: Literal["LOW", "MODERATE", "HIGH", "CRITICAL"]
    confidence: float
    prediction_window_hours: int
    factors: list[FloodFactor]

