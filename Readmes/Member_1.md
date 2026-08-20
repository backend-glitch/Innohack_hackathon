# 🌊 FloodGuard AI — Member 1
# AI/ML Flood Prediction Module

## 👤 Role

You are responsible for the entire AI/ML subsystem of FloodGuard AI.

Your job is to transform environmental data into:

- Flood probability
- Flood risk level
- Prediction window
- Confidence score
- Explainable risk factors

You DO NOT own the frontend, main backend, or routing engine.

---

# 🎯 Primary Objective

Build an ML service that accepts environmental features and returns a standardized flood-risk prediction.

Expected flow:

Weather / IoT / historical data
            ↓
      Feature processing
            ↓
        ML Model
            ↓
     Flood probability
            ↓
       Risk classification
            ↓
       Backend API response

---

# 🧠 Recommended Technology

- Python 3.11+
- Pandas
- NumPy
- Scikit-learn
- XGBoost
- FastAPI
- Uvicorn
- Joblib
- Jupyter / Google Colab

---

# 📁 Your Folder

Create:

ml-service/

├── app/
│   ├── main.py
│   ├── model.py
│   ├── preprocessing.py
│   ├── schemas.py
│   └── explain.py
│
├── models/
│   ├── flood_model.pkl
│   └── scaler.pkl
│
├── data/
│   ├── raw/
│   └── processed/
│
├── notebooks/
│
├── tests/
│
├── requirements.txt
└── README.md

---

# 📊 Input Features

The model should support these features:

- latitude
- longitude
- rainfall_1h
- rainfall_6h
- rainfall_24h
- rainfall_72h
- river_level
- river_level_change
- temperature
- humidity
- soil_moisture
- elevation
- distance_from_river
- forecast_rainfall_24h
- forecast_rainfall_72h
- historical_flood_frequency

The exact model may use fewer features if the dataset does not contain all of them.

DO NOT invent scientifically meaningless features just to increase the number of columns.

---

# 🤖 Model

Preferred first model:

XGBoost Classifier / Regressor

Alternative:

Random Forest

Do NOT spend excessive time implementing deep learning unless a reliable dataset is available.

---

# 🎯 Prediction

The model should produce:

risk_score: 0–100

risk_level:

0–29   = LOW
30–59  = MODERATE
60–79  = HIGH
80–100 = CRITICAL

---

# 🔌 API CONTRACT

The ML service must expose:

POST /predict

Request:

{
  "latitude": 12.97,
  "longitude": 79.15,
  "rainfall_1h": 20,
  "rainfall_6h": 65,
  "rainfall_24h": 128,
  "rainfall_72h": 210,
  "river_level": 4.8,
  "river_level_change": 0.35,
  "temperature": 27,
  "humidity": 89,
  "soil_moisture": 82,
  "elevation": 18,
  "distance_from_river": 1.2,
  "forecast_rainfall_24h": 145,
  "forecast_rainfall_72h": 280,
  "historical_flood_frequency": 0.62
}

Response:

{
  "risk_score": 82,
  "risk_level": "CRITICAL",
  "confidence": 0.91,
  "prediction_window_hours": 12,
  "factors": [
    {
      "name": "Heavy rainfall",
      "impact": "HIGH"
    },
    {
      "name": "Rapid river-level increase",
      "impact": "HIGH"
    },
    {
      "name": "Low elevation",
      "impact": "MEDIUM"
    }
  ]
}

---

# ⚠️ Important API Rules

DO NOT change the response field names without informing Member 2.

The following fields are mandatory:

risk_score
risk_level
confidence
prediction_window_hours
factors

---

# 🧪 Demo Mode

If the real ML model is unavailable, create a DEMO_MODE.

Example:

DEMO_MODE=true

The API should still return realistic predictions.

This ensures the entire application can be demonstrated even if the model fails.

---

# 📈 Model Evaluation

Document:

- Accuracy
- Precision
- Recall
- F1 score
- Confusion matrix

For flood prediction, pay special attention to RECALL for flood events.

A false negative can be more dangerous than a false positive.

---

# 🧠 Explainability

The API must return basic reasons for the prediction.

Example:

High rainfall
Rapid river rise
Low elevation
High soil saturation

Do not return only:

"AI says 82%"

The frontend needs an explanation.

---

# 🔒 Do NOT

- Modify frontend files
- Modify routing logic
- Modify backend API contracts
- Commit API keys
- Commit large raw datasets unnecessarily
- Hardcode the frontend URL

---

# 🧪 Testing

Before merging:

Test:

POST /predict

Test cases:

1. Normal weather → LOW
2. Heavy rainfall → HIGH
3. Heavy rainfall + rising river → CRITICAL
4. Missing input → validation error
5. Invalid values → validation error

---

# 📦 requirements.txt

Include only required packages.

Example:

fastapi
uvicorn
pandas
numpy
scikit-learn
xgboost
joblib
pydantic

---

# 🚀 Running Locally

Create environment:

python -m venv .venv

Activate environment.

Install:

pip install -r requirements.txt

Run:

uvicorn app.main:app --reload --port 8000

API:

http://localhost:8000

Swagger:

http://localhost:8000/docs

---

# ✅ Definition of Done

Member 1 is finished when:

[ ] Dataset prepared
[ ] Features documented
[ ] Model trained
[ ] Model evaluated
[ ] Model saved
[ ] FastAPI service works
[ ] POST /predict works
[ ] Response follows exact contract
[ ] Explainability implemented
[ ] Demo mode implemented
[ ] README updated
[ ] Tests pass
[ ] Member 2 successfully calls the API

---

# 🤝 Integration

Coordinate with:

Member 2 → API integration

Member 3 → prediction visualization

Member 4 → route risk weighting

DO NOT directly modify another member's module.