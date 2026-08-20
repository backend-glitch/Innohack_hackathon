 # 🌊 FloodGuard AI

### AI-Powered Flood Prediction, Early Warning & Safe Evacuation System

> **Predict. Warn. Explain. Evacuate.**

FloodGuard AI is an AI-powered disaster management platform designed to predict localized flood risks, provide early warnings, visualize affected areas, and dynamically recommend safer evacuation routes.

The system combines **weather data, river/IoT sensor data, geographical information, machine learning, flood-risk mapping, and risk-aware routing** into a single platform for both citizens and disaster-management authorities.

---

## 🚨 Problem Statement

Floods are among the most destructive natural disasters, causing loss of life, infrastructure damage, displacement, and disruption of transportation.

Existing flood-warning systems often focus on detecting or reporting flooding but may not provide citizens with enough actionable information such as:

* **Where exactly is the flood risk?**
* **How severe will it be?**
* **When is the risk expected to increase?**
* **Why is the area considered dangerous?**
* **Which roads should be avoided?**
* **Where is the nearest safe shelter?**
* **What is the safest route to reach it?**

FloodGuard AI aims to bridge the gap between **flood prediction and real-world action**.

---

# 💡 Our Solution

FloodGuard AI transforms environmental data into actionable emergency intelligence.

```text
Weather Data
     │
     ├──────────────┐
     │              │
River / IoT Data    │
     │              │
     └──────┬───────┘
            ▼
     Data Processing
            │
            ▼
      AI Flood Model
            │
            ▼
    ┌───────────────┐
    │ Flood Risk %  │
    │ Risk Level    │
    │ Prediction    │
    │ Explanation   │
    └───────┬───────┘
            │
      ┌─────┴─────┐
      ▼           ▼
   Risk Map    Road Risk
                  │
                  ▼
             A* Routing
                  │
                  ▼
             Safe Route
                  │
                  ▼
          🏠 Safe Shelter
                  │
                  ▼
           🚨 Alert System
```

---

# 🎯 Key Objectives

### 1. Predict

Use machine learning to estimate flood probability for a specific geographic area.

### 2. Localize

Convert predictions into hyper-local flood-risk zones.

### 3. Explain

Show users why an area has a high flood risk.

### 4. Warn

Generate localized emergency warnings before conditions become critical.

### 5. Navigate

Calculate safer routes that avoid predicted flood-prone roads.

### 6. Protect

Recommend nearby shelters and emergency actions.

---

# ✨ Key Features

## 🧠 AI Flood Prediction

The system analyzes environmental factors such as:

* Rainfall
* River water level
* River-level change
* Weather forecast
* Soil moisture
* Elevation
* Distance from river
* Historical flood frequency

The ML model produces:

```text
Flood Probability
Risk Level
Prediction Window
Confidence
Risk Factors
```

### Risk Classification

|  Score | Level       |
| -----: | ----------- |
|   0–29 | 🟢 LOW      |
|  30–59 | 🟡 MODERATE |
|  60–79 | 🟠 HIGH     |
| 80–100 | 🔴 CRITICAL |

---

# 🗺️ Interactive Flood Risk Map

The platform visualizes predicted flood zones directly on an interactive map.

```text
🟢 Safe
🟡 Moderate
🟠 High
🔴 Critical
```

Users can:

* Search locations
* View their current area
* Inspect flood-risk zones
* View shelters
* View road conditions
* Visualize safe routes

---

# 🚨 Early Warning System

FloodGuard AI converts predictions into actionable warnings.

Example:

> 🔴 **CRITICAL FLOOD RISK**
>
> Your area may experience severe flooding within the next 12 hours.
>
> **Why?**
>
> 🌧️ Heavy rainfall forecast
> 🌊 River level rising rapidly
> ⛰️ Low-elevation region
>
> **Action:** Avoid low-lying roads and move toward the nearest safe shelter.

---

# 🛣️ AI-Powered Safe Route

A major differentiating feature of FloodGuard AI is **flood-aware navigation**.

Traditional navigation generally optimizes for:

```text
Shortest Route
```

FloodGuard AI optimizes for:

```text
Safest Practical Route
```

Each road segment receives a flood-risk penalty.

```text
Normal Road
     ↓
Low Cost

Moderate Risk
     ↓
Higher Cost

High Risk
     ↓
Very High Cost

Critical Flood Risk
     ↓
ROAD BLOCKED
```

An **A* / Dijkstra-based routing algorithm** then identifies a safer path.

### Example

```text
                 🔴 FLOOD ZONE
                ┌──────────────┐
                │      ❌      │
                │              │
👤 YOU ─────────┘              └──── Destination
     │
     │
     └───────────────┐
                     │
                     ▼
                 🏠 SHELTER
                  SAFE ROUTE
```

---

# 🏠 Emergency Shelters

The system maintains shelter information including:

* Location
* Capacity
* Current availability
* Medical support
* Water availability
* Operational status

The system can recommend the nearest **safe and available shelter**.

---

# 🌐 Multilingual Alerts

Emergency warnings can be provided in multiple languages.

Initial support:

* 🇬🇧 English
* 🇮🇳 தமிழ்
* 🇮🇳 हिंदी

This improves accessibility during emergencies, especially for users who may not be comfortable with English.

---

# 📡 IoT Sensor Simulation

For the prototype, real-time IoT sensor data can be simulated.

Example sensor parameters:

```text
Rainfall
River Level
River Level Change
Soil Moisture
```

The simulator can demonstrate changing environmental conditions:

```text
LOW
 ↓
MODERATE
 ↓
HIGH
 ↓
CRITICAL
```

This allows the complete prediction-to-alert pipeline to be demonstrated without requiring physical sensor hardware.

---

# 🏛️ Dual User System

## 👤 Citizen Dashboard

Citizens can access:

* Current flood risk
* Interactive risk map
* Weather conditions
* AI explanation
* Safe route
* Nearby shelters
* Emergency alerts

---

## 🏛️ Authority Dashboard

Disaster-management authorities can monitor:

```text
Critical Zones
High-Risk Zones
Active Alerts
Blocked Roads
Available Shelters
Sensor Status
Predicted Flood Areas
```

This provides a centralized view for emergency response and resource allocation.

---

# 🧠 Explainable AI

Instead of simply showing:

> **Flood Risk: 82%**

FloodGuard AI explains the prediction.

Example:

```text
             FLOOD RISK
                82%
                 │
       ┌─────────┼─────────┐
       ▼         ▼         ▼
   Rainfall    River     Elevation
     HIGH       HIGH       LOW
```

This makes the system easier to understand and improves trust in AI-generated warnings.

---

# 🏗️ System Architecture

```text
                         ┌─────────────────┐
                         │ Weather APIs    │
                         └────────┬────────┘
                                  │
                         ┌────────▼────────┐
                         │ IoT / Sensors   │
                         └────────┬────────┘
                                  │
                         ┌────────▼────────┐
                         │ Data Processing │
                         └────────┬────────┘
                                  │
                         ┌────────▼────────┐
                         │   ML Service    │
                         │ XGBoost / RF    │
                         └────────┬────────┘
                                  │
                         ┌────────▼────────┐
                         │ Backend API     │
                         │ Node + Express  │
                         └────────┬────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
              ▼                   ▼                   ▼
        ┌───────────┐       ┌────────────┐      ┌────────────┐
        │ MongoDB   │       │ Safe Route │      │ Alert      │
        │ Database  │       │ A* / Graph │      │ System     │
        └───────────┘       └─────┬──────┘      └────────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ React Frontend  │
                         │ Interactive Map │
                         └────────┬────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
             👤 Citizen                    🏛️ Authority
```

---

# 🧰 Technology Stack

## Frontend

* React
* Vite
* Tailwind CSS
* Leaflet / MapLibre
* Axios
* Recharts

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* Axios

## AI / ML

* Python
* Pandas
* NumPy
* Scikit-learn
* XGBoost
* FastAPI
* Joblib

## Routing

* OpenStreetMap
* GeoJSON
* A*
* Dijkstra
* Leaflet / MapLibre

## Development

* Git
* GitHub
* Postman
* VS Code

---

# 📂 Project Structure

```text
floodguard-ai/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── src/
│   ├── scripts/
│   └── package.json
│
├── ml-service/
│   ├── app/
│   ├── models/
│   ├── data/
│   ├── notebooks/
│   └── requirements.txt
│
├── routing/
│   ├── graph/
│   ├── algorithms/
│   ├── risk/
│   └── shelters/
│
├── data/
│
├── docs/
│
├── scripts/
│
├── TEAM_START_HERE.md
├── INTEGRATION_README.md
├── MEMBER_1_ML_README.md
├── MEMBER_2_BACKEND_README.md
├── MEMBER_3_FRONTEND_README.md
├── MEMBER_4_ROUTING_README.md
├── .env.example
└── README.md
```

---

# 👥 Team

## 🧠 Member 1 — AI/ML Engineer

### Responsibilities

* Dataset preparation
* Data preprocessing
* Feature engineering
* Flood prediction model
* Model evaluation
* Prediction API
* Explainable AI

### Main Module

```text
/ml-service
```

---

## ⚙️ Member 2 — Backend & Data Engineer

### Responsibilities

* REST APIs
* MongoDB
* Weather API integration
* ML integration
* IoT simulation
* Alert APIs
* System integration

### Main Module

```text
/backend
```

---

## 🗺️ Member 3 — Frontend & Visualization Engineer

### Responsibilities

* React application
* Interactive map
* Flood-risk visualization
* Citizen dashboard
* Authority dashboard
* Shelter visualization
* Alert UI
* Route visualization

### Main Module

```text
/frontend
```

---

## 🚨 Member 4 — Safe Routing & Emergency Systems Engineer

### Responsibilities

* Road graph
* Flood-risk road weighting
* A* / Dijkstra routing
* Safe-route generation
* Shelter selection
* Emergency response logic
* Route-risk analysis

### Main Module

```text
/routing
```

---

# 🔌 Core API Architecture

The frontend communicates with the backend.

```text
Frontend
   │
   ▼
Backend API
   │
   ├── Weather
   ├── Database
   ├── ML Service
   ├── Routing
   ├── Shelters
   └── Alerts
```

### Core Endpoints

```text
GET  /api/health

GET  /api/weather
GET  /api/risk
GET  /api/zones
GET  /api/shelters
GET  /api/alerts

POST /api/predict
POST /api/routes/safe
POST /api/alerts
POST /api/sensors/simulate
```

---

# 🔄 End-to-End Data Flow

```text
1. Weather / Sensor data arrives
                ↓
2. Backend processes data
                ↓
3. ML model predicts flood probability
                ↓
4. Risk score is generated
                ↓
5. Risk zones are updated
                ↓
6. Roads receive flood-risk penalties
                ↓
7. Safe route is calculated
                ↓
8. Nearby shelter is identified
                ↓
9. Localized warning is generated
                ↓
10. Citizen receives actionable guidance
```

---

# 🧪 Demo Mode

The entire system supports a simulated disaster scenario.

This ensures the application remains demonstrable even if an external API is unavailable.

Demo scenario:

```text
Normal Conditions
       ↓
Heavy Rainfall Begins
       ↓
River Level Rises
       ↓
AI Risk Increases
       ↓
Flood Zone Expands
       ↓
Road Becomes Dangerous
       ↓
Safe Route Recalculated
       ↓
Shelter Recommended
       ↓
Emergency Alert Sent
```

---

# 🎬 Hackathon Demo Flow

### Scene 1 — Normal Conditions

The user opens FloodGuard AI.

Risk:

```text
🟢 LOW — 18%
```

---

### Scene 2 — Environmental Conditions Change

Simulated sensors report:

```text
Rainfall ↑
River Level ↑
Soil Moisture ↑
```

---

### Scene 3 — AI Prediction

The model predicts:

```text
🔴 CRITICAL

Risk: 82%

Expected window:
12 hours
```

---

### Scene 4 — Explanation

The platform explains:

```text
Heavy rainfall
Rapid river-level increase
Low elevation
High soil saturation
```

---

### Scene 5 — Flood Map

The affected region becomes:

```text
🟢 → 🟡 → 🟠 → 🔴
```

---

### Scene 6 — Safe Route

The user requests:

> **Find Safe Route**

The system detects that the shortest route crosses a predicted flood zone.

It automatically calculates an alternative route.

---

### Scene 7 — Shelter

The system recommends:

```text
🏠 Emergency Shelter A

1.8 km away
288 spaces available
Medical support ✓
Water ✓
```

---

### Scene 8 — Alert

The user receives:

> 🚨 **CRITICAL FLOOD WARNING**
>
> Avoid low-lying roads.
>
> A safer evacuation route has been generated.
>
> Proceed toward the recommended shelter.

---

# 🛡️ Reliability & Fallback Strategy

FloodGuard AI should not depend on a single external service.

Fallback hierarchy:

```text
REAL-TIME DATA
      ↓
CACHED DATA
      ↓
SIMULATED DATA
      ↓
DEMO SCENARIO
```

The application should remain demonstrable even if:

* Weather API fails
* Routing service fails
* ML service temporarily fails
* Internet connectivity becomes unstable

---

# 🔐 Security

Never commit:

```text
.env
API keys
Passwords
Tokens
Private credentials
```

Use:

```text
.env.example
```

for required environment variables.

---

# 🌱 Git Workflow

Main branch:

```text
main
```

Feature branches:

```text
feature/ml-prediction
feature/backend
feature/frontend
feature/safe-routing
```

### Commit Convention

```text
feat:
fix:
refactor:
docs:
test:
chore:
```

Example:

```text
feat: add flood prediction endpoint
```

---

# 🚀 Local Development

## Clone

```bash
git clone <repository-url>
cd floodguard-ai
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on:

```text
http://localhost:5173
```

## Backend

```bash
cd backend
npm install
npm run dev
```

Runs on:

```text
http://localhost:5000
```

## ML Service

```bash
cd ml-service

python -m venv .venv

# Windows
.venv\Scripts\activate

pip install -r requirements.txt

uvicorn app.main:app --reload --port 8000
```

Runs on:

```text
http://localhost:8000
```

---

# 📊 Future Enhancements

The prototype can be extended with:

* Satellite imagery analysis
* Real IoT hardware
* Advanced time-series models
* Flood-depth estimation
* Computer-vision-based flood detection
* Voice-based emergency alerts
* Offline/PWA support
* More Indian regional languages
* Government disaster-management integration
* Real-time SMS alerts
* Emergency resource allocation
* Community reporting
* Crowd-sourced flood observations

---

# 🌍 Expected Impact

FloodGuard AI aims to shift disaster management from:

```text
REACTIVE
```

to:

```text
PREDICTIVE → PROACTIVE → ACTIONABLE
```

Instead of simply telling people that a flood is happening, the system aims to tell them:

> **Where the risk is, why it is happening, when it may become dangerous, which roads to avoid, and where they can safely go.**

---

# 🏆 Why FloodGuard AI?

Most systems stop at:

```text
Flood Detection
       ↓
Warning
```

FloodGuard AI extends this to:

```text
Prediction
    ↓
Localization
    ↓
Explanation
    ↓
Warning
    ↓
Risk-Aware Navigation
    ↓
Safe Shelter
    ↓
Action
```

### Our core philosophy:

> **Don't just predict the disaster. Help people act before it becomes one.**

---

# 📜 Disclaimer

FloodGuard AI is a hackathon prototype intended for research, demonstration, and educational purposes.

Predictions generated by the prototype should not be treated as official emergency warnings or as a replacement for instructions from authorized disaster-management authorities.

---

# ⭐ Project

**FloodGuard AI**

### AI-Powered Flood Prediction, Early Warning & Safe Evacuation System

**Predict. Warn. Explain. Evacuate.**

---

## 📄 Team Documentation

For detailed development instructions:

* `TEAM_START_HERE.md` — Start here before coding
* `INTEGRATION_README.md` — Architecture, API contracts and Git workflow
* `MEMBER_1_ML_README.md` — AI/ML responsibilities
* `MEMBER_2_BACKEND_README.md` — Backend & database responsibilities
* `MEMBER_3_FRONTEND_README.md` — Frontend & map responsibilities
* `MEMBER_4_ROUTING_README.md` — Safe routing & emergency system responsibilities
