"""Clean model loading and inference helpers for the FloodGuard ML API."""

from __future__ import annotations

import pickle
import sys
import types
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
VENV_SITE_PACKAGES = ROOT / ".venv" / "Lib" / "site-packages"
MODEL_PATH = ROOT / "models" / "flood_model_clean.pkl"
PREPROCESSOR_PATH = ROOT / "models" / "preprocessor_clean.pkl"


def _ensure_runtime_paths() -> None:
    if str(ROOT) not in sys.path:
        sys.path.insert(0, str(ROOT))
    if VENV_SITE_PACKAGES.exists() and str(VENV_SITE_PACKAGES) not in sys.path:
        sys.path.append(str(VENV_SITE_PACKAGES))


def _install_scipy_shim() -> None:
    if "scipy" in sys.modules and "scipy.sparse" in sys.modules:
        return

    scipy = types.ModuleType("scipy")
    sparse = types.ModuleType("scipy.sparse")

    class spmatrix:
        pass

    class csr_matrix(spmatrix):
        pass

    class csc_matrix(spmatrix):
        pass

    class coo_matrix(spmatrix):
        pass

    sparse.spmatrix = spmatrix
    sparse.csr_matrix = csr_matrix
    sparse.csc_matrix = csc_matrix
    sparse.coo_matrix = coo_matrix
    sparse.issparse = lambda value: isinstance(value, spmatrix)
    sparse.isspmatrix = lambda value: isinstance(value, spmatrix)
    sparse.isspmatrix_csr = lambda value: isinstance(value, csr_matrix)
    sparse.isspmatrix_csc = lambda value: isinstance(value, csc_matrix)
    sparse.isspmatrix_coo = lambda value: isinstance(value, coo_matrix)
    scipy.sparse = sparse
    sys.modules["scipy"] = scipy
    sys.modules["scipy.sparse"] = sparse


_ensure_runtime_paths()
_install_scipy_shim()

import xgboost as xgb  # noqa: E402


@dataclass(frozen=True)
class CleanModelBundle:
    booster: Any
    preprocessor: dict[str, Any]


@lru_cache(maxsize=1)
def load_clean_bundle() -> CleanModelBundle:
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Missing clean model artifact: {MODEL_PATH}")
    if not PREPROCESSOR_PATH.exists():
        raise FileNotFoundError(f"Missing clean preprocessor artifact: {PREPROCESSOR_PATH}")

    with MODEL_PATH.open("rb") as handle:
        booster = pickle.load(handle)
    with PREPROCESSOR_PATH.open("rb") as handle:
        preprocessor = pickle.load(handle)
    return CleanModelBundle(booster=booster, preprocessor=preprocessor)


def predict_probability(bundle: CleanModelBundle, frame: pd.DataFrame) -> float:
    dmatrix = xgb.DMatrix(frame, feature_names=list(frame.columns))
    probability = bundle.booster.predict(dmatrix)
    return float(np.asarray(probability)[0])
