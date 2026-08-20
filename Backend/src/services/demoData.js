const baseLocation = (lat, lng) => ({ location: { lat, lng } });

export function demoWeather(lat, lng) {
  return {
    ...baseLocation(lat, lng),
    temperature: 27,
    humidity: 91,
    rainfall: 128,
    rainfallProbability: 85,
    windSpeed: 14,
    condition: "Heavy Rain"
  };
}

export function demoRisk(lat, lng) {
  const riskScore = 92;
  const riskLevel = "CRITICAL";
  return {
    ...baseLocation(lat, lng),
    risk_score: riskScore,
    risk_level: riskLevel,
    confidence: 0.91,
    prediction_window_hours: 72,
    factors: [
      { name: "Heavy Rainfall", impact: 0.35 },
      { name: "High River Level", impact: 0.28 },
      { name: "High Soil Moisture", impact: 0.17 }
    ],
    probability: riskScore / 100,
    risk: riskLevel,
    predictionWindow: "72 hours",
    recommendation: "Avoid low-lying areas and move toward a safe shelter."
  };
}

export function demoZones(lat = 12.97, lng = 79.15) {
  return {
    zones: [
      {
        id: "zone-001",
        risk_score: 92,
        risk_level: "CRITICAL",
        polygon: [
          [lng - 0.01, lat - 0.01],
          [lng + 0.01, lat - 0.01],
          [lng + 0.01, lat + 0.01],
          [lng - 0.01, lat + 0.01]
        ]
      },
      {
        id: "zone-002",
        risk_score: 70,
        risk_level: "HIGH",
        polygon: [
          [lng - 0.02, lat - 0.02],
          [lng + 0.02, lat - 0.02],
          [lng + 0.02, lat + 0.02],
          [lng - 0.02, lat + 0.02]
        ]
      }
    ]
  };
}

export function demoRoute(from, to) {
  return {
    safe: true,
    risk: "LOW",
    distance: 4.8,
    estimatedTime: 14,
    riskAvoided: 0.82,
    routeType: "SAFE_ALTERNATIVE",
    route: [
      [from.lng, from.lat],
      [79.15, 12.965],
      [79.14, 12.96],
      [to.lng, to.lat]
    ]
  };
}

export function demoShelters(lat = 12.97, lng = 79.15) {
  return [
    {
      id: "S001",
      name: "Emergency Relief Center",
      lat: lat + 0.001,
      lng: lng - 0.01,
      distance: 1.2,
      capacity: 500,
      available: 320,
      available_capacity: 320,
      latitude: lat + 0.001,
      longitude: lng - 0.01,
      status: "OPEN"
    },
    {
      id: "S002",
      name: "Community Relief Center",
      lat: lat - 0.009,
      lng: lng - 0.006,
      distance: 2.4,
      capacity: 300,
      available: 180,
      available_capacity: 180,
      latitude: lat - 0.009,
      longitude: lng - 0.006,
      status: "OPEN"
    }
  ];
}

export function demoAlert(lat, lng) {
  return {
    alert: {
      level: "HIGH",
      title: "High Flood Risk",
      message: "Heavy rainfall and rising river levels indicate increased flood risk. Avoid low-lying roads.",
      probability: 0.82,
      recommendedAction: "Move toward a nearby safe shelter.",
      location: { lat, lng }
    }
  };
}

export function demoSensorReading(body = {}) {
  return {
    sensor_id: body.sensor_id || "river-001",
    rainfall: body.rainfall ?? 100,
    river_level: body.river_level ?? 4.8,
    river_level_change: body.river_level_change ?? 0.4,
    soil_moisture: body.soil_moisture ?? 82,
    risk_level: "HIGH"
  };
}
