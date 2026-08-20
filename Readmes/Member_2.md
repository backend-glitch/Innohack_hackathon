# ⚙️ FloodGuard AI — Member 2
# Backend + Database + Integration Module

## 👤 Role

You own:

- Main backend
- Database
- External API integration
- ML service integration
- IoT simulation
- Authentication if required
- API gateway

You are the central connector between all modules.

---

# 🎯 Architecture

Frontend
   ↓
Node.js / Express
   ↓
MongoDB
   ↓
├── ML Service
├── Weather API
├── Routing Service
├── Shelter System
└── Alert System

---

# 🧠 Technology

- Node.js
- Express
- MongoDB
- Mongoose
- Axios
- dotenv
- CORS
- JWT if authentication is required

---

# 📁 Folder Structure

backend/

├── src/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── services/
│   ├── middleware/
│   ├── utils/
│   └── app.js
│
├── scripts/
│   └── seed.js
│
├── tests/
│
├── server.js
├── package.json
├── .env.example
└── README.md

---

# 🗄️ Database Collections

Create:

users
locations
weather
sensors
flood_predictions
flood_zones
shelters
alerts

---

# 🌦️ Weather API

Weather API credentials must be stored in:

.env

Example:

WEATHER_API_KEY=
WEATHER_API_URL=

NEVER commit .env.

Commit:

.env.example

---

# 🔌 Main API CONTRACT

## Health

GET /api/health

Response:

{
  "status": "ok"
}

---

# Weather

GET /api/weather?lat=12.97&lng=79.15

Response:

{
  "temperature": 27,
  "humidity": 89,
  "rainfall": 128,
  "forecast": {
    "24h": 145,
    "72h": 280
  }
}

---

# Flood Risk

GET /api/risk?lat=12.97&lng=79.15

Response:

{
  "risk_score": 82,
  "risk_level": "CRITICAL",
  "confidence": 0.91,
  "prediction_window_hours": 12,
  "factors": []
}

The backend should internally call:

ML_SERVICE_URL/predict

---

# Flood Zones

GET /api/zones

Response:

{
  "zones": [
    {
      "id": "zone-001",
      "risk_score": 82,
      "risk_level": "CRITICAL",
      "polygon": []
    }
  ]
}

---

# Shelters

GET /api/shelters

Optional query:

?lat=
&lng=
&radius=

Response:

{
  "shelters": [
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
  ]
}

---

# Safe Route

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
  "route": [],
  "distance_km": 4.2,
  "estimated_minutes": 14,
  "risk_level": "LOW",
  "avoided_flood_zones": 2
}

---

# Alerts

GET /api/alerts

POST /api/alerts

Example:

{
  "location": "Zone A",
  "risk_level": "CRITICAL",
  "message": {
    "en": "Evacuate immediately",
    "ta": "உடனடியாக வெளியேறவும்",
    "hi": "तुरंत सुरक्षित स्थान पर जाएं"
  }
}

---

# 📡 IoT Simulator

Create:

POST /api/sensors/simulate

The simulator should generate:

- rainfall
- river level
- river level change
- soil moisture

Example:

{
  "sensor_id": "river-001",
  "rainfall": 100,
  "river_level": 4.8,
  "river_level_change": 0.4,
  "soil_moisture": 82
}

The simulator must support:

LOW → MODERATE → HIGH → CRITICAL

This is necessary for the live demo.

---

# 🔗 ML Integration

Environment:

ML_SERVICE_URL=http://localhost:8000

Backend should send environmental features to:

POST {ML_SERVICE_URL}/predict

Do not expose the ML service directly to the frontend.

Frontend should call:

Backend → ML

NOT:

Frontend → ML

---

# 🛡️ Error Handling

Every API must return predictable errors.

Example:

{
  "success": false,
  "error": {
    "code": "LOCATION_NOT_FOUND",
    "message": "Unable to find location"
  }
}

Never expose stack traces to frontend.

---

# 🧪 Testing

Test:

[ ] Backend starts
[ ] MongoDB connects
[ ] Weather API works
[ ] ML API works
[ ] Risk endpoint works
[ ] Shelter endpoint works
[ ] Route endpoint works
[ ] Alert endpoint works
[ ] IoT simulator works

---

# 🚀 Running

npm install

Create .env

npm run dev

Default:

http://localhost:5000

---

# 🔐 Environment Variables

Example:

PORT=5000
MONGODB_URI=
ML_SERVICE_URL=
WEATHER_API_KEY=
WEATHER_API_URL=
ROUTING_SERVICE_URL=

Never commit real values.

---

# ✅ Definition of Done

[ ] Express server
[ ] MongoDB
[ ] Weather integration
[ ] ML integration
[ ] Sensor simulator
[ ] Risk API
[ ] Zone API
[ ] Shelter API
[ ] Route API
[ ] Alert API
[ ] Error handling
[ ] API documentation
[ ] Postman collection
[ ] Frontend successfully connected