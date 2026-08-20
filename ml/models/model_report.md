# INDOFLOODS flood-severity model report

## Dataset and target

- Dataset: `ml/data/processed/flood_severity_dataset.csv` (4,548 event rows).
- Target: observed INDOFLOODS `Flood Type`, encoded as Flood = 0 and Severe Flood = 1.
- This is a **flood-severity model for already identified flood events**, not a general flood-occurrence prediction model.

## Features

- Used: 92 prepared pre-event/static features: T1d–T10d precipitation windows; approved catchment morphology, climate, climatological precipitation, socioeconomic, population, and location/threshold fields; and one-hot climate, land-cover, soil, and lithology fields.
- Excluded: EventID, GaugeID, Start Date, target, and all peak/discharge/volume/duration/timing fields. No raw categorical feature is present; categorical encoding was already deterministic one-hot encoding in the prepared dataset.
- Missingness: median imputation is fit from the training partition only for each evaluation. The saved final preprocessor contains medians fit on all training data for future inference.

## Primary validation methodology

Deterministic GroupShuffleSplit-style 80/20 gauge-disjoint holdout (5000 seeded candidates; selected for size and target-prevalence balance).

- Training: 3,638 events from 124 gauges; target distribution {'0': 2334, '1': 1304}.
- Validation: 910 events from 31 gauges; target distribution {'0': 585, '1': 325}.
- The training and validation gauges are disjoint.

## Primary metrics

- Accuracy: 0.7110
- Severe-Flood precision: 0.6348
- Severe-Flood recall: 0.4492
- Severe-Flood F1: 0.5261
- ROC-AUC: 0.7133
- Confusion matrix `[[TN, FP], [FN, TP]]`: `[[501, 84], [179, 146]]`.

The severe-flood recall is the key safety-oriented metric: it measures the fraction of labelled Severe Flood events correctly identified in the held-out gauges. The matrix image is saved as `confusion_matrix.png`.

## Time-aware secondary evaluation

Chronological holdout: train before 2013-07-04, validate on and after 2013-07-04.

- Training/validation events: 3,638 / 910.
- Severe-Flood recall: 0.3721; F1: 0.4451; ROC-AUC: 0.6641.
- This split has 86 gauges in both periods, so it is supplementary only; the gauge-disjoint result above is the main reported evaluation.

## Top predictive features

| Rank | Feature | Gain |
|---:|---|---:|
| 1 | Soil type__Luvisols | 59.697994 |
| 2 | Precipitation of Coldest Quarter | 55.653778 |
| 3 | Population Count | 26.296169 |
| 4 | Precipitation of Driest Quarter | 20.896141 |
| 5 | Danger Level | 19.691753 |
| 6 | Temperature Annual Range | 16.639938 |
| 7 | Mean Diurnal Range | 15.620687 |
| 8 | Land cover__No dominant class | 14.899324 |
| 9 | Precipitation of Wettest Month | 14.734314 |
| 10 | 2015_GDP_PC_PPP | 14.317543 |

Feature importance uses XGBoost gain from the final model. It is descriptive rather than causal.

## Leakage controls and limitations

- Post-event/outcome fields were not available in the processed feature set and were checked again before fitting.
- Group-disjoint primary validation prevents events from the same gauge appearing in both splits.
- `Danger Level` is known station metadata but is related to the target definition; it can act as a threshold proxy. Future work should compare models with and without warning/danger levels.
- T1d–T10d timing must be verified against the intended operational prediction cutoff.
- These metrics do not prove real-world flood prediction capability. They evaluate severity classification in this INDOFLOODS event dataset only.

## Recommended next step

Confirm precipitation-window timing, then run repeated grouped temporal validation and a warning/danger-level ablation before considering any deployment work.
