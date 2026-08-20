# 🌊 FloodGuard AI — API Contract

> **Purpose:** This document defines the exact API communication rules between the Frontend, Backend, ML Flood Prediction service, Routing service, Weather service, and Shelter/Alert systems.
>
> **IMPORTANT:** All members MUST follow these API contracts. Do not randomly change endpoint names, request fields, or response formats without informing the entire team.

---

## 1. 🏗️ API Architecture

The frontend communicates ONLY with the main Backend API.

```text
                    USER
                      │
                      ▼
              ┌───────────────┐
              │ React Frontend│
              │   Member 3    │
              └───────┬───────┘
                      │
                  HTTP / JSON
                      │
                      ▼
              ┌───────────────┐
              │ Express API   │
              │   Member 4    │
              └───────┬───────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
   ┌────────┐   ┌──────────┐  ┌──────────┐
   │   ML   │   │ Routing  │  │ Weather  │
   │Member 1│   │ Member 2 │  │ External │
   └────────┘   └──────────┘  └──────────┘
```

---

## 2. 🌐 Base URL

**Development**
```
http://localhost:5000/api
```

**Production**
```
https://YOUR-BACKEND-DOMAIN/api
```

The frontend should store the backend URL in an environment variable.

Example:
```
VITE_API_URL=http://localhost:5000/api
```

---

## 3. 📋 API Summary

| Method | Endpoint | Purpose | Owner |
|---|---|---|---|
| GET | `/health` | Check backend status | Member 4 |
| GET | `/weather` | Get weather information | Member 4 |
| GET | `/risk` | Get flood-risk prediction | Member 4 + Member 1 |
| GET | `/route` | Find safe route | Member 4 + Member 2 |
| GET | `/shelters` | Get nearby shelters | Member 4 + Member 2 |
| GET | `/alerts` | Get localized warning | Member 4 |
| POST | `/predict` | Internal ML prediction | Member 1 |

---

## 4. ❤️ Health Check API

**Endpoint**
```
GET /api/health
```

**Purpose**
Used to check whether the backend is running.

**Request**
No body required.

**Example**
```
GET http://localhost:5000/api/health
```

**Response**
```json
{
  "status": "ok",
  "service": "FloodGuard API",
  "timestamp": "2026-08-20T10:00:00Z"
}
```

**Frontend Usage**
The frontend can use this endpoint to display:
```
🟢 System Online
```

---

## 5. 🌧️ Weather API

**Endpoint**
```
GET /api/weather
```

**Query Parameters**
- `lat`
- `lng`

**Example**
```
GET /api/weather?lat=12.9698&lng=79.1559
```

**Request**
No JSON body is required.

**Response**
```json
{
  "location": {
    "lat": 12.9698,
    "lng": 79.1559
  },
  "temperature": 27,
  "humidity": 91,
  "rainfall": 128,
  "rainfallProbability": 85,
  "windSpeed": 14,
  "condition": "Heavy Rain"
}
```

**Field Description**

| Field | Type | Description |
|---|---|---|
| temperature | number | Temperature in °C |
| humidity | number | Humidity percentage |
| rainfall | number | Recent rainfall |
| rainfallProbability | number | Rain probability % |
| windSpeed | number | Wind speed |
| condition | string | Current weather condition |

---

## 6. 🌊 Flood Risk API

**Endpoint**
```
GET /api/risk
```

**Query Parameters**
- `lat`
- `lng`

**Example**
```
GET /api/risk?lat=12.9698&lng=79.1559
```

---

## 7. 🧠 Flood Risk Response

```json
{
  "location": {
    "lat": 12.9698,
    "lng": 79.1559
  },
  "probability": 0.82,
  "risk": "HIGH",
  "confidence": 0.91,
  "predictionWindow": "72 hours",
  "factors": [
    {
      "name": "Heavy Rainfall",
      "impact": 0.35
    },
    {
      "name": "High River Level",
      "impact": 0.28
    },
    {
      "name": "High Soil Moisture",
      "impact": 0.17
    }
  ],
  "recommendation": "Avoid low-lying areas and move toward a safe shelter."
}
```

---

## 8. 🚦 Risk Levels

The following risk levels MUST be used consistently.

```
LOW
MEDIUM
HIGH
CRITICAL
```

**Recommended Probability Mapping**

```
0.00 – 0.29 → LOW
0.30 – 0.59 → MEDIUM
0.60 – 0.79 → HIGH
0.80 – 1.00 → CRITICAL
```

The ML team may tune these thresholds, but any change must be communicated to the frontend and backend teams.

---

## 9. 🤖 Internal ML Prediction API

This endpoint belongs to **Member 1**.

**Endpoint**
```
POST /predict
```

This is an internal service endpoint.
**The frontend should NOT call this endpoint directly.**

---

## 10. 🧠 ML Request

```json
{
  "rainfall": 128,
  "riverLevel": 4.8,
  "riverLevelChange": 0.7,
  "temperature": 27,
  "humidity": 91,
  "soilMoisture": 80,
  "elevation": 12,
  "distanceFromRiver": 1.4
}
```

---

## 11. 🧠 ML Response

```json
{
  "probability": 0.82,
  "risk": "CRITICAL",
  "confidence": 0.91,
  "factors": [
    {
      "name": "Heavy Rainfall",
      "impact": 0.35
    },
    {
      "name": "Rapid River Rise",
      "impact": 0.28
    }
  ]
}
```

---

## 12. 🗺️ Safe Route API

**Endpoint**
```
GET /api/route
```

**Query Parameters**
- `from`
- `to`

**Example**
```
GET /api/route?from=12.9698,79.1559&to=12.9500,79.1300
```

---

## 13. 🚗 Safe Route Response

```json
{
  "safe": true,
  "risk": "LOW",
  "distance": 4.8,
  "estimatedTime": 14,
  "riskAvoided": 0.82,
  "routeType": "SAFE_ALTERNATIVE",
  "route": [
    [79.1559, 12.9698],
    [79.1500, 12.9650],
    [79.1400, 12.9600],
    [79.1300, 12.9500]
  ]
}
```

---

## 14. 🛣️ Route Types

Allowed values:
```
NORMAL
SAFE
SAFE_ALTERNATIVE
HIGH_RISK
BLOCKED
```

Example:
```json
{
  "routeType": "SAFE_ALTERNATIVE"
}
```

---

## 15. 🛡️ Route Risk Levels

Use:
```
LOW
MEDIUM
HIGH
CRITICAL
```

The routing service should consider:
- Flood zones
- River proximity
- Road closures
- Predicted flood probability
- Road accessibility
- Distance
- Estimated travel time

---

## 16. 🏠 Shelter API

**Endpoint**
```
GET /api/shelters
```

**Query Parameters (Optional)**
- `lat`
- `lng`
- `radius`

**Example**
```
GET /api/shelters?lat=12.9698&lng=79.1559&radius=10
```

---

## 17. 🏠 Shelter Response

```json
{
  "shelters": [
    {
      "id": "S001",
      "name": "Emergency Relief Center",
      "lat": 12.9701,
      "lng": 79.1451,
      "distance": 1.2,
      "capacity": 500,
      "available": 320,
      "status": "OPEN"
    },
    {
      "id": "S002",
      "name": "Community Relief Center",
      "lat": 12.9601,
      "lng": 79.1501,
      "distance": 2.4,
      "capacity": 300,
      "available": 180,
      "status": "OPEN"
    }
  ]
}
```

---

## 18. 🚨 Alert API

**Endpoint**
```
GET /api/alerts
```

**Query Parameters**
- `lat`
- `lng`

**Example**
```
GET /api/alerts?lat=12.9698&lng=79.1559
```

---

## 19. 🚨 Alert Response

```json
{
  "alert": {
    "level": "HIGH",
    "title": "High Flood Risk",
    "message": "Heavy rainfall and rising river levels indicate increased flood risk. Avoid low-lying roads.",
    "probability": 0.82,
    "recommendedAction": "Move toward a nearby safe shelter."
  }
}
```

---

## 20. 📱 Frontend Dashboard Data

The frontend dashboard should eventually be able to display:

```json
{
  "location": {
    "lat": 12.9698,
    "lng": 79.1559
  },
  "weather": {
    "temperature": 27,
    "humidity": 91,
    "rainfall": 128,
    "condition": "Heavy Rain"
  },
  "risk": {
    "probability": 0.82,
    "risk": "CRITICAL",
    "confidence": 0.91
  },
  "alert": {
    "level": "HIGH",
    "message": "Avoid low-lying roads."
  },
  "shelters": [],
  "route": {}
}
```

---

## 21. ❌ Error Response Format

ALL backend APIs should use a consistent error format.

```json
{
  "success": false,
  "error": {
    "code": "INVALID_LOCATION",
    "message": "Invalid latitude or longitude."
  }
}
```

---

## 22. 🔢 HTTP Status Codes

Use standard HTTP status codes.

```
200 → Successful request
201 → Resource created
400 → Invalid request
401 → Unauthorized
404 → Resource not found
429 → Too many requests
500 → Internal server error
503 → External service unavailable
```

---

## 23. ⚠️ Example Errors

**Invalid coordinates**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_LOCATION",
    "message": "Latitude and longitude are required."
  }
}
```

**ML service unavailable**
```json
{
  "success": false,
  "error": {
    "code": "ML_SERVICE_UNAVAILABLE",
    "message": "Flood prediction service is temporarily unavailable."
  }
}
```

**Routing service unavailable**
```json
{
  "success": false,
  "error": {
    "code": "ROUTING_SERVICE_UNAVAILABLE",
    "message": "Safe routing service is temporarily unavailable."
  }
}
```

---

## 24. 🧪 Demo Mode

The backend must support:
```
DEMO_MODE=true
```

When demo mode is enabled, APIs may return predefined demo responses.

Example:
```text
Frontend
   ↓
Backend
   ↓
DEMO_MODE=true
   ↓
Demo Data
```

When live services are available:
```text
Frontend
   ↓
Backend
   ↓
Real ML + Weather + Routing
```

---

## 25. 🔄 API Fallback Strategy

If an external service fails:

```text
Real Service
     │
     ▼
  Request
     │
     ▼
 ┌─────────┐
 │ Success?│
 └────┬────┘
      │
   YES│       NO
      │        │
      ▼        ▼
 Real Data   Demo Data
```

The application should not completely crash because one external API fails.

---

## 26. 🔐 API Keys

API keys must **NEVER** be sent from the frontend.

**Bad:**
```text
React → Weather API + API KEY
```

**Good:**
```text
React
  ↓
Backend
  ↓
Weather API + API KEY
```

Keys belong in `.env`.

Example:
```
WEATHER_API_KEY=YOUR_KEY
```

---

## 27. 📡 Content Type

Requests containing JSON must use:
```
Content-Type: application/json
```

Example:
```
Content-Type: application/json
```

Responses should normally return:
```
Content-Type: application/json
```

---

## 28. 🧭 Location Format

Latitude and longitude should always be represented as:
```
lat
lng
```

Example:
```json
{
  "lat": 12.9698,
  "lng": 79.1559
}
```

Do NOT randomly use:
```
latitude
longitude
```
inside some APIs and:
```
lat
lon
```
inside others.

**Use `lat` / `lng` throughout the project.**

---

## 29. 🗺️ Route Coordinate Format

For route coordinates, use:
```
[longitude, latitude]
```

Example:
```json
[
  [79.1559, 12.9698],
  [79.1500, 12.9650],
  [79.1400, 12.9600]
]
```

This is important when working with GeoJSON/map libraries.

---

## 30. ⏱️ Prediction Window

Flood predictions should support a target prediction window of:
```
72 hours
```

Example:
```json
{
  "predictionWindow": "72 hours"
}
```

If the model supports multiple horizons:
```json
{
  "predictions": [
    {
      "hours": 24,
      "probability": 0.55,
      "risk": "MEDIUM"
    },
    {
      "hours": 48,
      "probability": 0.71,
      "risk": "HIGH"
    },
    {
      "hours": 72,
      "probability": 0.82,
      "risk": "CRITICAL"
    }
  ]
}
```

---

## 31. 🌐 Multi-Language Alerts

The system may support:
```
English
Hindi
Tamil
```

Optional query parameter:
```
language
```

Example:
```
GET /api/alerts?lat=12.9698&lng=79.1559&language=ta
```

Response:
```json
{
  "alert": {
    "level": "HIGH",
    "title": "வெள்ள அபாயம்",
    "message": "தாழ்வான பகுதிகளைத் தவிர்த்து பாதுகாப்பான இடத்திற்குச் செல்லவும்."
  }
}
```

If multilingual support is not ready, English is the fallback.

---

## 32. 📊 Risk Factors

Risk factors should be returned as an array.

**Correct:**
```json
{
  "factors": [
    {
      "name": "Heavy Rainfall",
      "impact": 0.35
    },
    {
      "name": "High River Level",
      "impact": 0.28
    }
  ]
}
```

This allows the frontend to display:
```
Why is the risk high?

🌧️ Heavy Rainfall       35%
🌊 High River Level     28%
💧 Soil Moisture        17%
```

---

## 33. 🧠 Explainability

The ML system should provide at least:
- Flood Probability
- Risk Level
- Confidence
- Top Risk Factors

Example:
```json
{
  "probability": 0.82,
  "risk": "CRITICAL",
  "confidence": 0.91,
  "factors": [
    {
      "name": "Heavy Rainfall",
      "impact": 0.35
    }
  ]
}
```

---

## 34. 🔄 Versioning

For the hackathon, use:
```
/api
```

Example:
```
/api/risk
/api/route
/api/weather
```

If versioning becomes necessary:
```
/api/v1/risk
```

Do not change to `/api/v1` during the hackathon without informing the team.

---

## 35. 🧪 Testing APIs

Every member should test their API independently before integration.

Example tools:
- Browser
- Postman
- Thunder Client
- curl

Example:
```bash
curl http://localhost:5000/api/health
```

Expected:
```json
{
  "status": "ok",
  "service": "FloodGuard API"
}
```

---

## 36. 🔌 Integration Responsibility

**Member 1**
Provides:
```
POST /predict
```

**Member 2**
Provides:
```
GET /route
```
and routing/shelter data.

**Member 3**
Consumes:
```
/api/risk
/api/route
/api/weather
/api/shelters
/api/alerts
```

**Member 4**
Connects everything:
```text
Frontend
   ↓
Backend
   ↓
ML
Routing
Weather
Shelters
Alerts
```

---

## 37. 🚨 IMPORTANT API RULES

| Rule | Description |
|---|---|
| Rule 1 | Do not change endpoint names without informing the team. |
| Rule 2 | Do not change response fields without informing the team. |
| Rule 3 | Do not change data types unexpectedly. |
| Rule 4 | Do not expose API keys to the frontend. |
| Rule 5 | Return JSON consistently. |
| Rule 6 | Use standard HTTP status codes. |
| Rule 7 | Use the same latitude/longitude format everywhere. |
| Rule 8 | Always provide useful error messages. |
| Rule 9 | Support demo fallback. |
| Rule 10 | Test APIs before integration. |

---

## 38. 🏆 Final End-to-End API Flow

```text
                     USER
                       │
                       ▼
                React Frontend
                       │
                       │
                       ▼
                Express Backend
                       │
       ┌───────────────┼───────────────┐
       │               │               │
       ▼               ▼               ▼
   /api/risk       /api/route      /api/weather
       │               │               │
       ▼               ▼               ▼
      ML            Routing        Weather API
       │               │
       └───────┬───────┘
               │
               ▼
        /api/shelters
               │
               ▼
          /api/alerts
               │
               ▼
         Backend Response
               │
               ▼
        React Dashboard
               │
       ┌───────┴────────┐
       ▼                ▼
 Flood Warning      Safe Route
```

---

## 39. 🚀 Final Integration Checklist

Before merging:

- [ ] API endpoint works
- [ ] Request format is correct
- [ ] Response format is correct
- [ ] Error handling works
- [ ] No API keys committed
- [ ] Demo fallback works
- [ ] API documented here
- [ ] Frontend can consume response
- [ ] Backend integration tested
- [ ] No existing feature is broken

---

## 🚨 FINAL RULE

**This file is the single source of truth for API communication.**

If a member wants to change an API:

```text
Propose Change
      ↓
Inform Team
      ↓
Update API_CONTRACT.md
      ↓
Update Backend
      ↓
Update Frontend/Consumer
      ↓
Test
      ↓
Merge
```

**DO NOT silently change the API.**