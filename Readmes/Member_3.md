# 🗺️ FloodGuard AI — Member 3
# Frontend + Interactive Map

## 👤 Role

You own the complete user interface.

Primary responsibilities:

- Citizen dashboard
- Interactive map
- Flood visualization
- Risk dashboard
- Safe route visualization
- Shelter visualization
- Alerts UI
- Authority dashboard

---

# 🎯 Main Principle

The application must be understandable within 5 seconds.

A user should immediately understand:

1. Where am I?
2. Is my area dangerous?
3. What is the risk?
4. What should I do?
5. Where should I go?

---

# 🧠 Technology

- React
- Vite
- Tailwind CSS
- Leaflet / MapLibre
- Axios
- Recharts
- Lucide React

---

# 📁 Folder Structure

frontend/

├── src/
│   ├── components/
│   │   ├── Map/
│   │   ├── RiskCard/
│   │   ├── ShelterCard/
│   │   ├── AlertBanner/
│   │   └── RoutePanel/
│   │
│   ├── pages/
│   │   ├── CitizenDashboard.jsx
│   │   └── AuthorityDashboard.jsx
│   │
│   ├── services/
│   │   └── api.js
│   │
│   ├── hooks/
│   │
│   ├── utils/
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── public/
│
├── package.json
└── README.md

---

# 🎨 UI

Use a clean emergency-management interface.

Avoid:

- excessive animations
- huge gradients
- unnecessary cards
- cluttered dashboards

Priority:

Readability > decoration.

---

# 🗺️ Map

Use:

OpenStreetMap tiles

Display:

🟢 Low risk
🟡 Moderate
🟠 High
🔴 Critical

Map layers:

1. Flood zones
2. Roads
3. Shelters
4. User location
5. Safe route

---

# 🏠 Citizen Dashboard

Must contain:

- Current location
- Flood risk
- Risk percentage
- Prediction window
- Weather
- River status
- AI explanation
- Find safe route
- Nearby shelters
- Emergency alert

---

# 🚨 Risk Card

Example:

FLOOD RISK

92

CRITICAL

Expected within:
72 hours

Why?

🌧 Heavy rainfall
🌊 River rising rapidly
⛰ Low elevation

---

# 🏠 Shelter

Display:

Shelter name
Distance
Capacity
Available capacity
Status

Example:

Emergency Shelter A

1.8 km away

288 spaces available

OPEN

---

# 🛣️ Route

When user clicks:

FIND SAFE ROUTE

Call:

GET /api/route

Display:

Distance
ETA
Risk level
Avoided flood zones

Draw route on map.

---

# 🔌 API

Create:

src/services/api.js

All backend calls must be centralized here.

Example:

getRisk()
getWeather()
getZones()
getShelters()
getRoute()
getAlerts()

Do NOT scatter axios calls throughout components.

---

# 🌐 Environment

Use:

VITE_API_URL=

Example:

VITE_API_URL=http://localhost:5000/api

Never hardcode production URLs inside components.

---

# 📱 Responsive

Must work on:

Desktop
Tablet
Mobile

Hackathon judges may view the project on different screens.

---

# 🏛️ Authority Dashboard

Display:

Critical zones
High-risk zones
Moderate zones
Sensors online
Blocked roads
Shelter capacity
Active alerts

Include map.

---

# 🧪 Demo Mode

Frontend must support demo data.

If backend is unavailable:

VITE_DEMO_MODE=true

Show realistic static data.

This prevents a failed API from destroying the demo.

---

# 🚫 Do NOT

- Modify backend contracts
- Call ML directly
- Implement routing algorithms
- Commit API keys
- Hardcode secrets
- Rewrite another member's module

---

# 🚀 Running

npm install

npm run dev

---

# 🧪 Definition of Done

[ ] Dashboard
[ ] Interactive map
[ ] Risk zones
[ ] Weather card
[ ] Risk card
[ ] AI explanation
[ ] Shelters
[ ] Safe route
[ ] Alerts
[ ] Authority dashboard
[ ] Responsive design
[ ] Demo mode
[ ] API integration

---

# 🔌 Current Backend Contract

- Use `risk_score`, `risk_level`, `confidence`, `prediction_window_hours`, and `factors` for risk data.
- Keep using `GET /api/route` for now.
- Use `lat` / `lng` in backend-facing JSON.
- Treat `available_capacity` as supported for shelters during integration.
- If Leaflet needs `[lat, lng]`, convert locally in the frontend.
