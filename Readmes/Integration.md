# 🌊 FloodGuard AI
# Integration & Team Development Guide

## 🚨 READ THIS BEFORE CODING

This file defines how all 4 members work together.

The objective is NOT to build four separate projects.

The objective is to build ONE working system.

---

# 👥 Team

Member 1:
AI/ML

Member 2:
Backend + Database

Member 3:
Frontend + Maps

Member 4:
Safe Routing + Emergency Response

---

# 🏗️ System Architecture

                     WEATHER
                        │
                        ▼
                   ┌─────────┐
                   │ BACKEND │
                   └────┬────┘
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
        MongoDB        ML          Routing
                       │              │
                       └──────┬───────┘
                              ▼
                           Backend
                              │
                              ▼
                          Frontend
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
                 CITIZEN            AUTHORITY

---

# 📂 Repository

floodguard-ai/

├── frontend/
├── backend/
├── ml-service/
├── routing/
├── data/
├── docs/
├── scripts/
├── .env.example
├── docker-compose.yml
├── README.md
└── INTEGRATION_README.md

---

# 🌿 Git Strategy

Main branch:

main

Member branches:

feature/ml-prediction
feature/backend
feature/frontend
feature/safe-routing

NEVER directly push unfinished code to main.

---

# 🔄 Development Workflow

1. Pull latest main.

git pull origin main

2. Create/use your feature branch.

3. Make changes.

4. Test locally.

5. Commit.

6. Push.

7. Create Pull Request.

8. Another member reviews.

9. Merge into main.

---

# 📝 Commit Convention

Use:

feat:
fix:
refactor:
docs:
test:
chore:

Examples:

feat: add flood prediction endpoint

fix: handle missing rainfall data

feat: add safe route algorithm

docs: update API contract

---

# 🔌 SERVICES

Frontend:

http://localhost:5173

Backend:

http://localhost:5000

ML:

http://localhost:8000

Routing:

http://localhost:5001

---

# 🔗 SERVICE COMMUNICATION

Frontend
   ↓
Backend
   ↓
ML

Backend
   ↓
Routing

Backend
   ↓
MongoDB

IMPORTANT:

Frontend must communicate with Backend.

Frontend should NOT directly communicate with ML.

---

# 🌐 Environment Variables

Each service must use environment variables.

Frontend:

VITE_API_URL=

Backend:

PORT=
MONGODB_URI=
ML_SERVICE_URL=
ROUTING_SERVICE_URL=
WEATHER_API_KEY=
WEATHER_API_URL=

ML:

PORT=
MODEL_PATH=

Routing:

PORT=

---

# 🚨 NEVER COMMIT

.env

API keys

passwords

tokens

private credentials

large datasets

node_modules

.venv

---

# 📡 API CONTRACT

## GET /api/health

{
  "status": "ok"
}

---

# GET /api/weather

/api/weather?lat=12.97&lng=79.15

---

# GET /api/risk

/api/risk?lat=12.97&lng=79.15

Response:

{
  "risk_score": 82,
  "risk_level": "CRITICAL",
  "confidence": 0.91,
  "prediction_window_hours": 12,
  "factors": []
}

---

# GET /api/zones

Returns flood-risk map zones.

---

# GET /api/shelters

Returns available emergency shelters.

---

# POST /api/routes/safe

Request:

{
  "origin": {
    "lat": 12.97,
    "lng": 79.15
  },
  "destination": {
    "lat": 12.98,
    "lng": 79.17
  }
}

Response:

{
  "route": [],
  "distance_km": 4.2,
  "estimated_minutes": 14,
  "risk_level": "LOW",
  "avoided_flood_zones": 2
}

---

# POST /api/alerts

Creates emergency alert.

---

# 📊 Shared Data Model

Location:

{
  "latitude": 12.97,
  "longitude": 79.15
}

Risk:

{
  "risk_score": 82,
  "risk_level": "CRITICAL"
}

Risk levels MUST always be:

LOW
MODERATE
HIGH
CRITICAL

Do not create alternative names such as:

DANGER
SEVERE
VERY_HIGH

---

# 🧪 DEMO MODE

The entire application must work without external APIs.

Use:

DEMO_MODE=true

Demo mode should provide:

- simulated weather
- simulated sensors
- simulated flood predictions
- predefined flood zones
- predefined shelters
- predefined road graph

---

# 🎬 DEMO SCENARIO

The demo must follow this sequence.

STEP 1:

User opens FloodGuard AI.

STEP 2:

Map displays current area.

STEP 3:

System receives simulated environmental data.

STEP 4:

Rainfall increases.

STEP 5:

River level increases.

STEP 6:

AI changes:

LOW
→ MODERATE
→ HIGH
→ CRITICAL

STEP 7:

Flood zone appears on map.

STEP 8:

User clicks:

FIND SAFE ROUTE

STEP 9:

System detects that shortest route passes through a dangerous zone.

STEP 10:

A* generates alternative route.

STEP 11:

System recommends safe shelter.

STEP 12:

Emergency alert appears.

---

# 🧩 INTEGRATION TEST

Before final submission:

[ ] Frontend starts
[ ] Backend starts
[ ] Database connects
[ ] ML starts
[ ] Routing starts
[ ] Backend calls ML
[ ] Backend calls routing
[ ] Frontend calls backend
[ ] Map loads
[ ] Risk appears
[ ] Flood zones appear
[ ] Shelters appear
[ ] Safe route appears
[ ] Alert appears
[ ] Demo mode works
[ ] No API key exposed
[ ] No console errors

---

# 🚨 FALLBACK STRATEGY

If something breaks:

LEVEL 1:

Real API

↓

LEVEL 2:

Cached data

↓

LEVEL 3:

Demo data

↓

LEVEL 4:

Static predefined scenario

The demo MUST work even if:

Weather API fails.

ML service fails.

Routing API fails.

Internet becomes unstable.

---

# 🛑 MERGE RULE

Before merging:

1. Pull main.
2. Resolve conflicts locally.
3. Run application.
4. Test API.
5. Test frontend.
6. Confirm no breaking changes.
7. Open Pull Request.
8. Review.
9. Merge.

---

# 🤝 API CHANGE RULE

If you need to change an API:

DO NOT silently change it.

Inform all affected members.

Example:

OLD:

risk_score

NEW:

riskScore

This is a BREAKING CHANGE.

---

# 🧠 Ownership

Member 1 owns:

/ml-service

Member 2 owns:

/backend

Member 3 owns:

/frontend

Member 4 owns:

/routing

Everyone can read everything.

Do not modify another member's subsystem without coordination.

---

# 📦 Final Deployment

Recommended:

Frontend → Vercel

Backend → Render / Railway

ML → Render / Railway

Database → MongoDB Atlas

Routing → Backend or same deployment

---

# 🏆 FINAL SUCCESS CRITERIA

The project is successful when a judge can:

1. Open the application.
2. See a flood-risk map.
3. Select a location.
4. See AI flood probability.
5. Understand WHY the area is at risk.
6. See predicted flood timing.
7. Find nearby shelters.
8. Request a safe route.
9. See dangerous roads avoided.
10. Receive a localized emergency warning.

---

# 🚀 GOLDEN RULE

BUILD THE DEMO FIRST.

Every feature must answer:

"Will this improve our final demonstration?"

If not, postpone it.

The goal is a reliable end-to-end system, not maximum feature count.