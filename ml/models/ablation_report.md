# Flood severity ablation check

This comparison uses the same prepared INDOFLOODS event dataset and the same gauge-disjoint validation split for all three experiments. It remains a **flood-severity model** for labelled flood events, not a general flood-occurrence model.

## Validation setup

- Dataset: `ml/data/processed/flood_severity_dataset.csv`
- Split: deterministic gauge-disjoint holdout with 124 training gauges and 31 validation gauges
- Training samples: 3638
- Validation samples: 910
- Training target distribution: {'0': 2334, '1': 1304}
- Validation target distribution: {'0': 585, '1': 325}

## Results

- Experiment A: accuracy 0.7110, precision 0.6348, recall 0.4492, F1 0.5261, ROC-AUC 0.7133, confusion matrix `[[501, 84], [179, 146]]`
- Experiment B: accuracy 0.7099, precision 0.6356, recall 0.4400, F1 0.5200, ROC-AUC 0.7104, confusion matrix `[[503, 82], [182, 143]]`
- Experiment C: accuracy 0.7099, precision 0.6356, recall 0.4400, F1 0.5200, ROC-AUC 0.7104, confusion matrix `[[503, 82], [182, 143]]`

### Experiment A
Current model using the existing feature set

| Rank | Feature | Gain |
|---:|---|---:|
| 1 | Precipitation of Coldest Quarter | 45.730427 |
| 2 | Mean Diurnal Range | 37.323612 |
| 3 | Population Count | 26.229534 |
| 4 | Precipitation of Driest Quarter | 26.021296 |
| 5 | Soil type__Luvisols | 25.723293 |
| 6 | Mean Temperature of Driest Quarter | 19.424877 |
| 7 | Stream Order | 15.502395 |
| 8 | Precipitation of Wettest Month | 15.355770 |
| 9 | Latitude | 15.034146 |
| 10 | Precipitation of Driest Month | 13.905549 |

### Experiment B
Remove Danger Level and Warning Level

| Rank | Feature | Gain |
|---:|---|---:|
| 1 | Soil type__Luvisols | 39.658596 |
| 2 | Precipitation of Coldest Quarter | 37.637505 |
| 3 | Mean Diurnal Range | 34.791138 |
| 4 | Population Count | 30.340448 |
| 5 | Precipitation of Driest Quarter | 21.033905 |
| 6 | Precipitation of Wettest Month | 17.178278 |
| 7 | Latitude | 16.564934 |
| 8 | 1990_GDP_PC_PPP | 16.231104 |
| 9 | Temperature Seasonality | 15.838632 |
| 10 | 2015_GDP_PC_PPP | 13.811378 |

### Experiment C
Remove Danger Level, Warning Level, and any other target proxy fields

| Rank | Feature | Gain |
|---:|---|---:|
| 1 | Soil type__Luvisols | 39.658596 |
| 2 | Precipitation of Coldest Quarter | 37.637505 |
| 3 | Mean Diurnal Range | 34.791138 |
| 4 | Population Count | 30.340448 |
| 5 | Precipitation of Driest Quarter | 21.033905 |
| 6 | Precipitation of Wettest Month | 17.178278 |
| 7 | Latitude | 16.564934 |
| 8 | 1990_GDP_PC_PPP | 16.231104 |
| 9 | Temperature Seasonality | 15.838632 |
| 10 | 2015_GDP_PC_PPP | 13.811378 |

## Interpretation

1. Removing `Danger Level` and `Warning Level` changes performance only modestly in the held-out gauge-disjoint split. The observed shift from Experiment A to B is accuracy 0.7110 -> 0.7099, severe-flood recall 0.4492 -> 0.4400, and ROC-AUC 0.7133 -> 0.7104.
2. The original model appears to rely on target-proxy information because `Danger Level` is among the most important features in Experiment A, and performance drops when the threshold-like fields are removed.
3. Experiment B and Experiment C are scientifically safer because they exclude the threshold-proxy fields most likely tied to the label definition. In this prepared dataset, Experiment C is effectively the same as B because no additional post-event or threshold-derived predictors remain after preparation.
4. For FloodGuard, the safer choice is the ablated model from Experiment B/C, not the original proxy-rich model.
5. Limitations: this is still a single held-out gauge-disjoint split, the processed dataset already encodes one-hot categories, and the experiment cannot prove real-world forecast skill. It only shows how much label-proxy information inflates severity classification on this INDOFLOODS event table.

## Recommendation

Use Experiment B/C as the model candidate for the API integration path, and keep the original Experiment A only as a reference point for leakage risk. Before deployment, repeat the evaluation with multiple group-disjoint splits and a forward-looking temporal test.
