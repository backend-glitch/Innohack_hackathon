import {
  buildDemoRegion,
  buildForecastSeries,
  demoCenterFallback,
  forecastWindows,
  getScenarioProfile,
} from '../data.js'
import {
  analyzeFloodState,
  buildFloodZones,
  buildRoadLayers,
  chooseBestShelter,
  haversineKm,
  planRoute,
} from '../routing.js'

const baseUrl = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

function buildUrl(path, params = {}) {
  if (!baseUrl) return path
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    query.set(key, String(value))
  }
  const queryString = query.toString()
  return `${baseUrl}${path}${queryString ? `?${queryString}` : ''}`
}

async function requestJson(path, options = {}) {
  if (!baseUrl) {
    throw new Error('API base URL not configured')
  }

  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  return response.json()
}

function normalizeRegion(regionOrCenter) {
  if (regionOrCenter?.nodes) return regionOrCenter
  const center = regionOrCenter?.anchor || regionOrCenter || demoCenterFallback
  return buildDemoRegion(center)
}

function fallbackLatestSensors(region, simulated) {
  return region.sensors.map((sensor) => ({
    ...sensor,
    value: sensor.value[simulated ? 'simulated' : 'normal'],
    trend: sensor.trend[simulated ? 'simulated' : 'normal'],
    source: 'demo',
  }))
}

function fallbackWeather(region, simulated) {
  const profile = getScenarioProfile(simulated)
  return {
    location: region.anchor,
    temperature: simulated ? 25 : 28,
    humidity: simulated ? 92 : 78,
    rainfall: profile.rainfall,
    rainfallProbability: simulated ? 89 : 61,
    windSpeed: simulated ? 18 : 12,
    condition: simulated ? 'Heavy Rain' : 'Overcast',
    source: 'demo',
  }
}

function fallbackRisk(region, horizon, simulated) {
  const forecast = buildForecastSeries({ simulated })
  const selected = forecast.find((item) => item.hours === horizon) ?? forecast[0]
  const factors = analyzeFloodState({ region, horizon, simulated })
    .slice()
    .sort((left, right) => right.riskScore - left.riskScore)
    .slice(0, 3)
    .map((item) => ({
      name: item.name,
      impact: Number((item.riskScore / 100).toFixed(2)),
    }))

  return {
    location: region.anchor,
    probability: Number((selected.risk / 100).toFixed(2)),
    risk: selected.risk >= 80 ? 'CRITICAL' : selected.risk >= 60 ? 'HIGH' : selected.risk >= 30 ? 'MEDIUM' : 'LOW',
    confidence: selected.confidence,
    predictionWindow: `${horizon} hours`,
    factors,
    recommendation: selected.risk >= 80 ? 'Move toward a safe shelter immediately.' : 'Monitor conditions and avoid low-lying roads.',
    predictions: forecast.map((item) => ({
      hours: item.hours,
      probability: Number((item.risk / 100).toFixed(2)),
      risk: item.risk >= 80 ? 'CRITICAL' : item.risk >= 60 ? 'HIGH' : item.risk >= 30 ? 'MEDIUM' : 'LOW',
      confidence: item.confidence,
      rainfall: item.rainfall,
      riverLevel: item.riverLevel,
      riskGrowth: item.riskGrowth,
    })),
    source: 'demo',
  }
}

function fallbackShelters(region) {
  return {
    shelters: region.shelters.map((shelter) => ({
      ...shelter,
      availableSpaces: Math.max(0, shelter.capacity - shelter.occupancy),
      distance: Number(haversineKm(region.anchor, shelter.latlng).toFixed(1)),
      status: 'OPEN',
      source: 'demo',
    })),
  }
}

function fallbackAlerts({ region, horizon, simulated, selectedShelterId, language }) {
  const selectedShelter =
    region.shelters.find((shelter) => shelter.id === selectedShelterId) ?? region.shelters[0]
  const best = chooseBestShelter({ region, horizon, simulated })
  const route = planRoute({
    region,
    destinationId: selectedShelter.nodeId,
    horizon,
    simulated,
  })
  const riskLevel = route.risk_score >= 82 ? 'critical' : route.risk_score >= 58 ? 'high' : route.risk_score >= 30 ? 'moderate' : 'low'

  return {
    alert: {
      id: 'alert-1',
      level: riskLevel.toUpperCase(),
      title:
        riskLevel === 'critical'
          ? 'Critical Flood Risk'
          : riskLevel === 'high'
            ? 'High Flood Risk'
            : riskLevel === 'moderate'
              ? 'Moderate Flood Risk'
              : 'Low Flood Risk',
      message:
        selectedShelter.id === best.shelter.id
          ? language === 'hi'
            ? 'अनुशंसित शरण मार्ग उपलब्ध है।'
            : language === 'ta'
              ? 'பரிந்துரைக்கப்பட்ட தஞ்சக பாதை கிடைக்கிறது.'
              : 'Recommended shelter route is available.'
          : language === 'hi'
            ? 'वैकल्पिक मार्ग चुना गया; परिस्थितियाँ बदल रही हैं।'
            : language === 'ta'
              ? 'மாற்றுப் பாதை தேர்ந்தெடுக்கப்பட்டது; நிலைமைகள் மாறுகின்றன.'
              : 'Alternate route selected; conditions are changing.',
      probability: Number((route.risk_score / 100).toFixed(2)),
      recommendedAction:
        language === 'hi'
          ? 'निकटतम सुरक्षित शरण स्थल की ओर जाएँ।'
          : language === 'ta'
            ? 'அருகிலுள்ள பாதுகாப்பான தஞ்சகத்தை நோக்கிச் செல்லுங்கள்.'
            : 'Move toward a nearby safe shelter.',
      source: 'demo',
    },
  }
}

function fallbackRoute({ region, sourceId = 'home', destinationId, horizon, simulated }) {
  return planRoute({
    region,
    sourceId,
    destinationId,
    horizon,
    simulated,
  })
}

function parseForecastSeries(riskResponse, fallbackSeries) {
  if (!Array.isArray(riskResponse?.predictions) || riskResponse.predictions.length === 0) {
    return fallbackSeries
  }

  return forecastWindows.map((hours, index) => {
    const apiItem = riskResponse.predictions.find((item) => Number(item.hours) === hours)
    const fallback = fallbackSeries[index] ?? fallbackSeries[0]
    const probability = apiItem?.probability ?? riskResponse.probability ?? fallback.risk / 100
    const confidence = apiItem?.confidence ?? riskResponse.confidence ?? fallback.confidence
    const riskScore = apiItem?.riskScore ?? Math.round(Number(probability) * 100)

    return {
      hours,
      rainfall: apiItem?.rainfall ?? fallback.rainfall,
      riverLevel: apiItem?.riverLevel ?? fallback.riverLevel,
      confidence: Number(confidence.toFixed ? confidence.toFixed(2) : Number(confidence).toFixed(2)),
      riskGrowth: apiItem?.riskGrowth ?? fallback.riskGrowth,
      risk: Number(riskScore.toFixed ? riskScore.toFixed(1) : Number(riskScore).toFixed(1)),
    }
  })
}

async function getWeather(region, simulated) {
  try {
    return await requestJson(buildUrl('/api/weather', {
      lat: region.anchor.lat,
      lng: region.anchor.lng,
    }))
  } catch {
    return fallbackWeather(region, simulated)
  }
}

async function getRisk(region, horizon, simulated) {
  try {
    return await requestJson(buildUrl('/api/risk', {
      lat: region.anchor.lat,
      lng: region.anchor.lng,
    }))
  } catch {
    return fallbackRisk(region, horizon, simulated)
  }
}

async function getRoute({ region, sourceId = 'home', destinationId, from, to, horizon, simulated }) {
  try {
    return await requestJson(buildUrl('/api/route', {
      from: `${from.lat},${from.lng}`,
      to: `${to.lat},${to.lng}`,
    }))
  } catch {
    return fallbackRoute({ region, sourceId, destinationId, horizon, simulated })
  }
}

async function getShelters(region) {
  try {
    return await requestJson(buildUrl('/api/shelters', {
      lat: region.anchor.lat,
      lng: region.anchor.lng,
      radius: 10,
    }))
  } catch {
    return fallbackShelters(region)
  }
}

async function getAlerts({ region, horizon, simulated, selectedShelterId, language = 'en' }) {
  try {
    return await requestJson(buildUrl('/api/alerts', {
      lat: region.anchor.lat,
      lng: region.anchor.lng,
      language,
    }))
  } catch {
    return fallbackAlerts({ region, horizon, simulated, selectedShelterId, language })
  }
}

export async function loadDashboardSnapshot({
  regionOrCenter,
  horizon,
  simulated,
  selectedShelterId,
  sourceId = 'home',
  language = 'en',
}) {
  const region = normalizeRegion(regionOrCenter)
  const selectedShelter =
    region.shelters.find((shelter) => shelter.id === selectedShelterId) ??
    chooseBestShelter({ region, sourceId, horizon, simulated }).shelter

  const [weather, risk, route, shelters, alerts] = await Promise.all([
    getWeather(region, simulated),
    getRisk(region, horizon, simulated),
    getRoute({
      region,
      sourceId,
      destinationId: selectedShelter.nodeId,
      from: region.anchor,
      to: selectedShelter.latlng,
      horizon,
      simulated,
    }),
    getShelters(region),
    getAlerts({ region, horizon, simulated, selectedShelterId, language }),
  ])

  const prediction = parseForecastSeries(risk, buildForecastSeries({ simulated }))
  const shelterList = Array.isArray(shelters) ? shelters : shelters?.shelters ?? []
  const alertList = Array.isArray(alerts) ? alerts : alerts?.alert ? [alerts.alert] : []

  return {
    mode: baseUrl ? 'api-ready' : 'demo',
    region,
    weather,
    risk,
    sensors: fallbackLatestSensors(region, simulated),
    shelters: shelterList,
    alerts: alertList,
    riskZones: buildFloodZones({ region, horizon, simulated }),
    roadLayers: buildRoadLayers({ region, horizon, simulated }),
    prediction,
    route: typeof route?.route?.[0] === 'number' || Array.isArray(route?.route?.[0]) ? route : fallbackRoute({ region, sourceId, destinationId: selectedShelter.nodeId, horizon, simulated }),
    profile: getScenarioProfile(simulated),
  }
}

export {
  getAlerts,
  getRisk,
  getRoute,
  getShelters,
  getWeather,
}
