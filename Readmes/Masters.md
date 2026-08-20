# 🌊 FLOODGUARD AI — AI MASTER INSTRUCTIONS

> THIS FILE IS THE SINGLE SOURCE OF TRUTH FOR ALL AI CODING ASSISTANTS IN THIS PROJECT.

---

# 1. PROJECT

Project Name:

**FloodGuard AI**

Project Type:

**AI-Powered Flood Prediction, Early Warning & Safe Route Recommendation System**

Core idea:

> Predict flood risk, explain the risk, warn people early, and help them reach a safer location using a flood-aware route.

---

# 2. PROBLEM STATEMENT

Floods can cause loss of life, infrastructure damage, displacement, and transportation disruption.

People often receive warnings without enough actionable information.

Our system should answer:

1. Is my location at risk?
2. How serious is the risk?
3. When could the situation become dangerous?
4. Why is the area at risk?
5. Which roads should I avoid?
6. What is the safest practical route?
7. Where is the nearest safe shelter?
8. What action should I take?

---

# 3. FINAL PRODUCT

The final system should work like this:

USER
  ↓
LOCATION
  ↓
WEATHER + SENSOR DATA
  ↓
AI FLOOD PREDICTION
  ↓
FLOOD RISK SCORE
  ↓
RISK MAP
  ↓
DANGEROUS ROADS
  ↓
SAFE ROUTE
  ↓
SAFE SHELTER
  ↓
EARLY WARNING / ALERT


The final application must feel like ONE product.

Do NOT build four separate projects.

---

# 4. TEAM

There are 4 members.

### MEMBER 1 — AI/ML

Responsible for:

- Flood prediction model
- Dataset
- Data preprocessing
- Feature engineering
- Model evaluation
- Prediction API
- Explainable AI

Main folder:

`/ml-service`

---

### MEMBER 2 — BACKEND

Responsible for:

- Node.js
- Express
- MongoDB
- REST APIs
- Weather API
- Sensor simulation
- ML integration
- Alert APIs
- Overall backend integration

Main folder:

`/backend`

---

### MEMBER 3 — FRONTEND

Responsible for:

- React
- Dashboard
- Interactive map
- Flood visualization
- Risk cards
- Alerts UI
- Shelter UI
- Safe-route visualization
- Citizen dashboard
- Authority dashboard

Main folder:

`/frontend`

---

### MEMBER 4 — SAFE ROUTING

Responsible for:

- Road graph
- Flood-risk road weighting
- A*
- Dijkstra
- Safe route
- Shelter selection
- Emergency routing logic

Main folder:

`/routing`

---

# 5. YOUR ROLE

## IMPORTANT

Before doing ANYTHING, identify which member you are assisting.

The human will tell you:

`MY ROLE = MEMBER 1`

OR

`MY ROLE = MEMBER 2`

OR

`MY ROLE = MEMBER 3`

OR

`MY ROLE = MEMBER 4`

You MUST stay inside that role.

---

# 6. ABSOLUTE ANTI-DISTRACTION RULE

## DO NOT WORK OUTSIDE YOUR ROLE.

If you are Member 1:

DO NOT build:

- React UI
- Backend APIs
- Routing algorithms
- Dashboard
- Authentication

If you are Member 2:

DO NOT build:

- ML model
- React UI
- Routing algorithms

If you are Member 3:

DO NOT build:

- ML model
- Backend architecture
- Routing engine

If you are Member 4:

DO NOT build:

- React UI
- ML model
- Backend architecture

---

# 7. NO SCOPE CREEP

Do NOT add features just because they sound impressive.

Do NOT automatically add:

- Chatbot
- Login
- Authentication
- Blockchain
- Cryptocurrency
- Social media
- Payment system
- Complex microservices
- Kubernetes
- Unnecessary Docker setup
- Voice assistant
- AR/VR
- Facial recognition
- Unnecessary AI models
- Unnecessary animations
- Unnecessary dashboards

unless the human explicitly requests them.

---

# 8. HACKATHON PRIORITY

Always prioritize:

### P0 — MUST WORK

1. Flood prediction
2. Risk score
3. Risk map
4. Safe route
5. Shelter recommendation
6. Alerts
7. Backend
8. Frontend
9. Integration

### P1 — IMPORTANT

1. Explainable AI
2. IoT simulation
3. Multilingual alerts
4. 72-hour prediction
5. Authority dashboard

### P2 — OPTIONAL

1. Satellite imagery
2. Voice alerts
3. Advanced simulations
4. Offline mode
5. Computer vision

If time is limited:

**P0 > P1 > P2**

Never sacrifice P0 for P2.

---

# 9. CORE ARCHITECTURE

The architecture is:

Weather / Sensor Data
        ↓
Data Processing
        ↓
AI/ML Model
        ↓
Flood Risk
        ↓
Backend
        ↓
 ┌───────────────┐
 │               │
 ▼               ▼
Risk Map      Safe Routing
                 ↓
              Shelter
                 ↓
               Alert
                 ↓
              Frontend

---

# 10. PROJECT STRUCTURE

```text
floodguard-ai/

├── frontend/
│
├── backend/
│
├── ml-service/
│
├── routing/
│
├── data/
│
├── docs/
│
├── scripts/
│
├── README.md
│
├── AI_MASTER_INSTRUCTIONS.md
│
└── .env.example