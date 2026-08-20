"""Train and evaluate the first INDOFLOODS flood-severity model.

Run with the project-local XGBoost runtime on PYTHONPATH when necessary.
This script never reads or writes the raw datasets.
"""

from __future__ import annotations

import json
import pickle
import struct
import zlib
from pathlib import Path

import numpy as np
import pandas as pd
from xgboost import XGBClassifier


ROOT = Path(__file__).resolve().parent
DATA_PATH = ROOT / "data" / "processed" / "flood_severity_dataset.csv"
MODEL_DIR = ROOT / "models"
TARGET = "Flood Severity"
AUDIT_COLUMNS = ["EventID", "GaugeID", "Start Date", TARGET]
RANDOM_STATE = 42


def metrics(y_true: np.ndarray, probability: np.ndarray) -> dict:
    prediction = (probability >= 0.5).astype(int)
    tn = int(((y_true == 0) & (prediction == 0)).sum())
    fp = int(((y_true == 0) & (prediction == 1)).sum())
    fn = int(((y_true == 1) & (prediction == 0)).sum())
    tp = int(((y_true == 1) & (prediction == 1)).sum())
    precision = tp / (tp + fp) if (tp + fp) else 0.0
    recall = tp / (tp + fn) if (tp + fn) else 0.0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) else 0.0
    # Mann-Whitney rank formulation of ROC-AUC, with tied-score rank averaging.
    ranks = pd.Series(probability).rank(method="average").to_numpy()
    positives = int((y_true == 1).sum())
    negatives = int((y_true == 0).sum())
    roc_auc = (ranks[y_true == 1].sum() - positives * (positives + 1) / 2) / (positives * negatives)
    return {
        "accuracy": round((tp + tn) / len(y_true), 6),
        "precision_severe_flood": round(precision, 6),
        "recall_severe_flood": round(recall, 6),
        "f1_severe_flood": round(f1, 6),
        "roc_auc": round(float(roc_auc), 6),
        "confusion_matrix": [[tn, fp], [fn, tp]],
    }


def group_disjoint_split(frame: pd.DataFrame, test_fraction: float = 0.2) -> tuple[np.ndarray, np.ndarray]:
    """Choose a deterministic, prevalence-balanced GroupShuffleSplit-style holdout."""
    groups = frame["GaugeID"].drop_duplicates().to_numpy()
    group_count = round(len(groups) * test_fraction)
    overall_rate = frame[TARGET].mean()
    generator = np.random.default_rng(RANDOM_STATE)
    best = None
    for _ in range(5000):
        validation_groups = set(generator.choice(groups, size=group_count, replace=False))
        valid_mask = frame["GaugeID"].isin(validation_groups).to_numpy()
        y_valid = frame.loc[valid_mask, TARGET]
        if y_valid.nunique() != 2:
            continue
        score = abs(valid_mask.mean() - test_fraction) + abs(y_valid.mean() - overall_rate)
        if best is None or score < best[0]:
            best = (score, valid_mask)
    if best is None:
        raise RuntimeError("Could not construct a two-class gauge-disjoint validation split.")
    valid_mask = best[1]
    return np.flatnonzero(~valid_mask), np.flatnonzero(valid_mask)


def impute_train_apply(train: pd.DataFrame, valid: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame, dict]:
    medians = train.median(numeric_only=True).to_dict()
    return train.fillna(medians), valid.fillna(medians), medians


def build_model() -> XGBClassifier:
    return XGBClassifier(
        objective="binary:logistic",
        n_estimators=250,
        max_depth=4,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        reg_lambda=1.0,
        eval_metric="logloss",
        random_state=RANDOM_STATE,
        n_jobs=4,
    )


def write_confusion_png(matrix: list[list[int]], destination: Path) -> None:
    """Write a simple self-contained 2x2 confusion-matrix heatmap PNG."""
    width, height, margin, cell = 520, 520, 60, 200
    maximum = max(max(row) for row in matrix) or 1
    image = np.full((height, width, 3), 255, dtype=np.uint8)
    for row in range(2):
        for col in range(2):
            value = matrix[row][col] / maximum
            color = np.array([230 - int(150 * value), 245 - int(80 * value), 255 - int(20 * value)], dtype=np.uint8)
            y0, x0 = margin + row * cell, margin + col * cell
            image[y0:y0 + cell - 4, x0:x0 + cell - 4] = color
    glyphs = {
        "0": ("111", "101", "101", "101", "111"), "1": ("010", "110", "010", "010", "111"),
        "2": ("111", "001", "111", "100", "111"), "3": ("111", "001", "111", "001", "111"),
        "4": ("101", "101", "111", "001", "001"), "5": ("111", "100", "111", "001", "111"),
        "6": ("111", "100", "111", "101", "111"), "7": ("111", "001", "010", "010", "010"),
        "8": ("111", "101", "111", "101", "111"), "9": ("111", "101", "111", "001", "111"),
    }
    scale, gap = 8, 8
    for row in range(2):
        for col in range(2):
            text = str(matrix[row][col])
            text_width = len(text) * 3 * scale + (len(text) - 1) * gap
            start_x = margin + col * cell + (cell - text_width) // 2
            start_y = margin + row * cell + (cell - 5 * scale) // 2
            for character_index, character in enumerate(text):
                for glyph_y, glyph_row in enumerate(glyphs[character]):
                    for glyph_x, pixel in enumerate(glyph_row):
                        if pixel == "1":
                            x0 = start_x + character_index * (3 * scale + gap) + glyph_x * scale
                            y0 = start_y + glyph_y * scale
                            image[y0:y0 + scale, x0:x0 + scale] = 20
    raw = b"".join(b"\x00" + image[y].tobytes() for y in range(height))
    def chunk(kind: bytes, body: bytes) -> bytes:
        return struct.pack(">I", len(body)) + kind + body + struct.pack(">I", zlib.crc32(kind + body) & 0xFFFFFFFF)
    destination.write_bytes(b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)) + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b""))


def evaluate_split(frame: pd.DataFrame, feature_columns: list[str], train_index: np.ndarray, valid_index: np.ndarray) -> tuple[dict, XGBClassifier, dict]:
    x_train = frame.iloc[train_index][feature_columns]
    x_valid = frame.iloc[valid_index][feature_columns]
    y_train = frame.iloc[train_index][TARGET].to_numpy()
    y_valid = frame.iloc[valid_index][TARGET].to_numpy()
    x_train, x_valid, medians = impute_train_apply(x_train, x_valid)
    model = build_model()
    model.fit(x_train, y_train)
    result = metrics(y_valid, model.predict_proba(x_valid)[:, 1])
    result.update({
        "training_samples": int(len(train_index)),
        "validation_samples": int(len(valid_index)),
        "training_gauges": int(frame.iloc[train_index]["GaugeID"].nunique()),
        "validation_gauges": int(frame.iloc[valid_index]["GaugeID"].nunique()),
        "training_target_distribution": {str(k): int(v) for k, v in frame.iloc[train_index][TARGET].value_counts().sort_index().items()},
        "validation_target_distribution": {str(k): int(v) for k, v in frame.iloc[valid_index][TARGET].value_counts().sort_index().items()},
    })
    return result, model, medians


def main() -> None:
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    frame = pd.read_csv(DATA_PATH)
    frame["Start Date"] = pd.to_datetime(frame["Start Date"], errors="raise")
    if TARGET not in frame or "GaugeID" not in frame:
        raise ValueError("Prepared dataset must include Flood Severity and GaugeID.")
    forbidden = {"Flood Type", "Peak Flood Level (m)", "Peak FL Date", "Peak Discharge Q (cumec)", "Peak Discharge Date", "Flood Volume (cumec)", "Event Duration (days)", "Time to Peak (days)", "Recession Time (day)", "End Date"}
    feature_columns = [column for column in frame.columns if column not in AUDIT_COLUMNS]
    if forbidden.intersection(feature_columns):
        raise ValueError("A forbidden outcome/post-event feature is present.")

    train_idx, valid_idx = group_disjoint_split(frame)
    primary, _, _ = evaluate_split(frame, feature_columns, train_idx, valid_idx)
    primary["validation_method"] = "Deterministic GroupShuffleSplit-style 80/20 gauge-disjoint holdout (5000 seeded candidates; selected for size and target-prevalence balance)."

    # Secondary chronological evaluation; documented separately because gauges can overlap across time.
    cutoff = frame["Start Date"].sort_values().iloc[int(len(frame) * 0.8)]
    time_train_idx = np.flatnonzero((frame["Start Date"] < cutoff).to_numpy())
    time_valid_idx = np.flatnonzero((frame["Start Date"] >= cutoff).to_numpy())
    temporal, _, _ = evaluate_split(frame, feature_columns, time_train_idx, time_valid_idx)
    temporal["validation_method"] = f"Chronological holdout: train before {cutoff.date()}, validate on and after {cutoff.date()}."
    temporal["overlapping_gauges"] = int(len(set(frame.iloc[time_train_idx]["GaugeID"]) & set(frame.iloc[time_valid_idx]["GaugeID"])))

    # Fit production artifact on all prepared events, with medians computed from all available training data.
    x_all = frame[feature_columns]
    all_medians = x_all.median(numeric_only=True).to_dict()
    model = build_model()
    model.fit(x_all.fillna(all_medians), frame[TARGET].to_numpy())
    preprocessor = {
        "strategy": "median imputation fit on training data",
        "feature_columns": feature_columns,
        "medians": all_medians,
        "categorical_encoding": "one-hot encoding performed in flood_severity_dataset.csv",
        "excluded_audit_columns": AUDIT_COLUMNS,
    }
    with (MODEL_DIR / "flood_model.pkl").open("wb") as handle:
        pickle.dump(model, handle)
    with (MODEL_DIR / "preprocessor.pkl").open("wb") as handle:
        pickle.dump(preprocessor, handle)

    importance = model.get_booster().get_score(importance_type="gain")
    importance_rows = []
    for name in feature_columns:
        importance_rows.append({"feature name": name, "importance_gain": float(importance.get(name, 0.0))})
    importance_frame = pd.DataFrame(importance_rows).sort_values("importance_gain", ascending=False, ignore_index=True)
    importance_frame.insert(0, "rank", np.arange(1, len(importance_frame) + 1))
    importance_frame.to_csv(MODEL_DIR / "feature_importance.csv", index=False)
    write_confusion_png(primary["confusion_matrix"], MODEL_DIR / "confusion_matrix.png")

    evaluation = {
        "dataset": str(DATA_PATH).replace("\\", "/"),
        "target": {"name": TARGET, "mapping": {"Flood": 0, "Severe Flood": 1}},
        "feature_count": len(feature_columns),
        "primary_group_disjoint_evaluation": primary,
        "secondary_time_aware_evaluation": temporal,
    }
    (MODEL_DIR / "evaluation.json").write_text(json.dumps(evaluation, indent=2), encoding="utf-8")

    top10 = importance_frame.head(10)
    matrix = primary["confusion_matrix"]
    top10_table = "| Rank | Feature | Gain |\n|---:|---|---:|\n" + "\n".join(
        f"| {int(row['rank'])} | {row['feature name']} | {row['importance_gain']:.6f} |"
        for _, row in top10.iterrows()
    )
    report = f'''# INDOFLOODS flood-severity model report

## Dataset and target

- Dataset: `ml/data/processed/flood_severity_dataset.csv` ({len(frame):,} event rows).
- Target: observed INDOFLOODS `Flood Type`, encoded as Flood = 0 and Severe Flood = 1.
- This is a **flood-severity model for already identified flood events**, not a general flood-occurrence prediction model.

## Features

- Used: {len(feature_columns)} prepared pre-event/static features: T1d–T10d precipitation windows; approved catchment morphology, climate, climatological precipitation, socioeconomic, population, and location/threshold fields; and one-hot climate, land-cover, soil, and lithology fields.
- Excluded: EventID, GaugeID, Start Date, target, and all peak/discharge/volume/duration/timing fields. No raw categorical feature is present; categorical encoding was already deterministic one-hot encoding in the prepared dataset.
- Missingness: median imputation is fit from the training partition only for each evaluation. The saved final preprocessor contains medians fit on all training data for future inference.

## Primary validation methodology

{primary['validation_method']}

- Training: {primary['training_samples']:,} events from {primary['training_gauges']} gauges; target distribution {primary['training_target_distribution']}.
- Validation: {primary['validation_samples']:,} events from {primary['validation_gauges']} gauges; target distribution {primary['validation_target_distribution']}.
- The training and validation gauges are disjoint.

## Primary metrics

- Accuracy: {primary['accuracy']:.4f}
- Severe-Flood precision: {primary['precision_severe_flood']:.4f}
- Severe-Flood recall: {primary['recall_severe_flood']:.4f}
- Severe-Flood F1: {primary['f1_severe_flood']:.4f}
- ROC-AUC: {primary['roc_auc']:.4f}
- Confusion matrix `[[TN, FP], [FN, TP]]`: `{matrix}`.

The severe-flood recall is the key safety-oriented metric: it measures the fraction of labelled Severe Flood events correctly identified in the held-out gauges. The matrix image is saved as `confusion_matrix.png`.

## Time-aware secondary evaluation

{temporal['validation_method']}

- Training/validation events: {temporal['training_samples']:,} / {temporal['validation_samples']:,}.
- Severe-Flood recall: {temporal['recall_severe_flood']:.4f}; F1: {temporal['f1_severe_flood']:.4f}; ROC-AUC: {temporal['roc_auc']:.4f}.
- This split has {temporal['overlapping_gauges']} gauges in both periods, so it is supplementary only; the gauge-disjoint result above is the main reported evaluation.

## Top predictive features

{top10_table}

Feature importance uses XGBoost gain from the final model. It is descriptive rather than causal.

## Leakage controls and limitations

- Post-event/outcome fields were not available in the processed feature set and were checked again before fitting.
- Group-disjoint primary validation prevents events from the same gauge appearing in both splits.
- `Danger Level` is known station metadata but is related to the target definition; it can act as a threshold proxy. Future work should compare models with and without warning/danger levels.
- T1d–T10d timing must be verified against the intended operational prediction cutoff.
- These metrics do not prove real-world flood prediction capability. They evaluate severity classification in this INDOFLOODS event dataset only.

## Recommended next step

Confirm precipitation-window timing, then run repeated grouped temporal validation and a warning/danger-level ablation before considering any deployment work.
'''
    (MODEL_DIR / "model_report.md").write_text(report, encoding="utf-8")
    print(json.dumps({"primary": primary, "temporal": temporal, "top_features": top10.to_dict(orient="records")}, indent=2))


if __name__ == "__main__":
    main()
