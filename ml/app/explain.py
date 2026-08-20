"""Lightweight explanation helpers for the FloodGuard ML API."""

from __future__ import annotations

from typing import Any

import numpy as np
import pandas as pd

from .preprocessing import demo_factors
from .schemas import FloodPredictRequest


def explain_prediction(
    request: FloodPredictRequest,
    adapted_frame: pd.DataFrame,
    booster: Any,
    feature_columns: list[str],
    medians: dict[str, float],
    demo_mode: bool,
) -> list[dict[str, float]]:
    if demo_mode:
        return demo_factors(request)

    # The clean model only has defensible request-side access to latitude/longitude,
    # but those are not appropriate user-facing causal factors for flood severity.
    # Until the API can map actual hydrologic inputs into trained model features,
    # we return an empty explanation list rather than inventing one.
    return []
