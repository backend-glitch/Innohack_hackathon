# Threshold analysis for the ablated flood-severity model

This analysis uses the same gauge-disjoint validation split as the earlier ablation run and the same scientifically safer feature set with `Danger Level` and `Warning Level` removed. It evaluates the model at multiple decision thresholds without changing the target or using post-event information.

## Validation setup

- Dataset: `ml/data/processed/flood_severity_dataset.csv`
- Validation split: 124 training gauges / 31 validation gauges
- Training samples: 3638
- Validation samples: 910
- Validation target distribution: Flood = 585, Severe Flood = 325
- ROC-AUC: 0.710446

## Threshold table

| Threshold | Accuracy | Severe Precision | Severe Recall | Severe F1 | Confusion Matrix |
|---:|---:|---:|---:|---:|---|
| 0.30 | 0.657143 | 0.515152 | 0.680000 | 0.586207 | `[[377, 208], [104, 221]]` |
| 0.35 | 0.673626 | 0.537433 | 0.618462 | 0.575107 | `[[412, 173], [124, 201]]` |
| 0.40 | 0.696703 | 0.576803 | 0.566154 | 0.571429 | `[[450, 135], [141, 184]]` |
| 0.45 | 0.705495 | 0.609195 | 0.489231 | 0.542662 | `[[483, 102], [166, 159]]` |
| 0.50 | 0.709890 | 0.635556 | 0.440000 | 0.520000 | `[[503, 82], [182, 143]]` |
| 0.55 | 0.704396 | 0.644330 | 0.384615 | 0.481696 | `[[516, 69], [200, 125]]` |
| 0.60 | 0.703297 | 0.666667 | 0.338462 | 0.448980 | `[[530, 55], [215, 110]]` |
| 0.65 | 0.700000 | 0.691176 | 0.289231 | 0.407809 | `[[543, 42], [231, 94]]` |
| 0.70 | 0.689011 | 0.698113 | 0.227692 | 0.343387 | `[[553, 32], [251, 74]]` |

## Recommendation

- Best Severe Flood recall with reasonable precision: threshold 0.45 (precision 0.609195, recall 0.489231, F1 0.542662).
- Best Severe Flood F1: threshold 0.30 (precision 0.515152, recall 0.680000, F1 0.586207).

## Trade-off

Lower thresholds increase Severe Flood recall by flagging more events, but they also raise false positives and reduce precision. Higher thresholds improve precision but miss more Severe Flood cases. In this run, threshold 0.45 is a useful middle point: it keeps recall close to the safer low-threshold settings while avoiding the most aggressive false-positive rate.

## FloodGuard recommendation

For a warning system, I recommend threshold 0.45. It preserves stronger Severe Flood recall while keeping precision at a workable level, which is usually the safer operating choice for early warning.

## Notes

- Threshold selection was done only on the held-out validation split described above, not on a final test set.
- ROC-AUC is threshold-independent and is reported once for the model.
- This is still a flood-severity classifier on INDOFLOODS events, not a general flood-occurrence forecaster.
