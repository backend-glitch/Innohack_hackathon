# 🚨 FloodGuard AI — Member 4
# Safe Routing + Emergency Response

## 👤 Role

You own the system that converts flood predictions into actionable evacuation decisions.

Your primary responsibility:

PREDICTED FLOOD
      ↓
ROAD RISK
      ↓
SAFE ROUTE
      ↓
SHELTER
      ↓
EMERGENCY ACTION

---

# 🎯 Core Feature

The system must avoid dangerous roads based on predicted flood risk.

Normal routing:

A → B

Flood-aware routing:

A → safe road → safe road → shelter

while avoiding:

flooded roads
high-risk zones
low-elevation dangerous areas

---

# 🧠 Technology

- JavaScript / Node.js
- Graph algorithms
- A*
- Dijkstra
- GeoJSON
- OpenStreetMap
- Leaflet / MapLibre

---

# 📁 Folder

routing/

├── graph/
│   ├── nodes.js
│   └── edges.js
│
├── algorithms/
│   ├── astar.js
│   └── dijkstra.js
│
├── risk/
│   └── roadRisk.js
│
├── shelters/
│   └── shelters.json
│
├── services/
│   └── routingService.js
│
├── tests/
│
└── README.md

---

# 🗺️ Road Graph

Represent roads as:

NODE:

{
  "id": "n1",
  "lat": 12.97,
  "lng": 79.15
}

EDGE:

{
  "from": "n1",
  "to": "n2",
  "distance": 1.2,
  "risk": 0.2
}

---

# ⚠️ Road Risk

Every road receives a risk score.

Example:

0–0.29:
LOW

0.30–0.59:
MODERATE

0.60–0.79:
HIGH

0.80–1.00:
CRITICAL

---

# 💰 Routing Cost

Normal:

cost = distance

Risk-aware:

cost = distance × risk_multiplier

Example:

LOW:

multiplier = 1

MODERATE:

multiplier = 2

HIGH:

multiplier = 5

CRITICAL:

road = BLOCKED

The exact values can be tuned during testing.

---

# 🧠 Algorithm

Use A*.

Heuristic:

straight-line geographic distance.

Goal:

Find the lowest-cost safe path.

The route should prioritize safety over shortest distance.

---

# 🔌 API CONTRACT

POST /api/routes/safe

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
  "route": [
    {
      "lat": 12.97,
      "lng": 79.15
    },
    {
      "lat": 12.975,
      "lng": 79.16
    },
    {
      "lat": 12.98,
      "lng": 79.17
    }
  ],
  "distance_km": 4.2,
  "estimated_minutes": 14,
  "risk_level": "LOW",
  "avoided_flood_zones": 2
}

---

# 🏠 Shelter System

Each shelter:

{
  "id": "s1",
  "name": "Emergency Shelter A",
  "latitude": 12.98,
  "longitude": 79.16,
  "capacity": 500,
  "available_capacity": 288,
  "medical_support": true,
  "water_available": true,
  "status": "OPEN"
}

---

# 🧭 Nearest Safe Shelter

Implement:

findNearestSafeShelter(origin)

Requirements:

1. Find nearby shelters.
2. Remove CLOSED shelters.
3. Remove FULL shelters.
4. Consider flood risk.
5. Select safest practical shelter.

---

# 🚨 Alert Levels

LOW:

Monitor conditions.

MODERATE:

Prepare for possible evacuation.

HIGH:

Avoid flood-prone areas.

CRITICAL:

Evacuate to a safe shelter.

---

# 🧪 Testing

Test:

[ ] Short safe route
[ ] Route through moderate zone
[ ] Route through high-risk zone
[ ] Completely blocked road
[ ] No safe route
[ ] Closed shelter
[ ] Full shelter
[ ] Multiple shelters

---

# 🧯 Fallback

If the external routing service fails:

Use the local demo graph.

The hackathon demo must NOT depend on one external API.

---

# 🚫 Do NOT

- Modify ML model
- Modify frontend components
- Change backend API contracts
- Store secrets
- Hardcode API keys

---

# 🚀 Definition of Done

[ ] Road graph
[ ] Risk weighting
[ ] A* / Dijkstra
[ ] Safe route
[ ] Flood-zone avoidance
[ ] Shelter selection
[ ] API integration
[ ] Fallback demo graph
[ ] Tests
[ ] Frontend successfully displays route