export const forecastWindows = [0, 6, 12, 24, 48, 72]

export const demoCenterFallback = {
  lat: 13.0418,
  lng: 80.2489,
}

const METERS_PER_DEG_LAT = 111_320

function metersPerDegLng(lat) {
  return METERS_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180)
}

export function offsetLatLng(base, northMeters = 0, eastMeters = 0) {
  return {
    lat: base.lat + northMeters / METERS_PER_DEG_LAT,
    lng: base.lng + eastMeters / metersPerDegLng(base.lat),
  }
}

export function toLatLngTuple(point) {
  return [point.lat, point.lng]
}

const nodeTemplates = [
  { id: 'home', label: 'Home', north: 0, east: 0 },
  { id: 'market', label: 'Market Road', north: 30, east: 130 },
  { id: 'canal', label: 'Canal Crossing', north: 10, east: 290 },
  { id: 'bridge', label: 'Bridge Point', north: -12, east: 455 },
  { id: 'central_approach', label: 'Central Approach', north: 24, east: 620 },
  { id: 'north_turn', label: 'North Turn', north: 155, east: 95 },
  { id: 'ridge', label: 'Ridge Road', north: 255, east: 240 },
  { id: 'north_cross', label: 'North Cross', north: 305, east: 410 },
  { id: 'clinic_access', label: 'Clinic Access', north: 330, east: 575 },
  { id: 'west_climb', label: 'West Climb', north: 125, east: -115 },
  { id: 'west_ridge', label: 'West Ridge', north: 250, east: -270 },
  { id: 'east_low', label: 'East Low Road', north: -58, east: 515 },
  { id: 'lakeside', label: 'Lakeside Access', north: -96, east: 695 },
]

const edgeTemplates = [
  ['home', 'market'],
  ['market', 'canal'],
  ['canal', 'bridge'],
  ['bridge', 'central_approach'],
  ['home', 'north_turn'],
  ['north_turn', 'ridge'],
  ['ridge', 'north_cross'],
  ['north_cross', 'clinic_access'],
  ['clinic_access', 'central_approach'],
  ['home', 'west_climb'],
  ['west_climb', 'west_ridge'],
  ['west_ridge', 'ridge'],
  ['north_cross', 'bridge'],
  ['bridge', 'east_low'],
  ['east_low', 'lakeside'],
  ['central_approach', 'lakeside'],
  ['canal', 'east_low'],
  ['north_cross', 'east_low'],
  ['ridge', 'clinic_access'],
]

const shelterTemplates = [
  {
    id: 'central_school',
    name: 'Demo Shelter - Central School',
    nodeId: 'central_approach',
    capacity: 340,
    occupancy: 190,
    note: 'Most direct destination for central neighborhoods.',
  },
  {
    id: 'ridge_hall',
    name: 'Demo Shelter - Ridge Community Hall',
    nodeId: 'ridge',
    capacity: 220,
    occupancy: 96,
    note: 'Higher ground option on the west ridge.',
  },
  {
    id: 'north_clinic',
    name: 'Demo Shelter - North Clinic Annex',
    nodeId: 'clinic_access',
    capacity: 180,
    occupancy: 124,
    note: 'Useful for northern evacuation flow.',
  },
  {
    id: 'lakeside_center',
    name: 'Demo Shelter - Lakeside Sports Center',
    nodeId: 'lakeside',
    capacity: 260,
    occupancy: 238,
    note: 'Lower-lying demo shelter, keep as contingency only.',
  },
]

const sensorTemplates = [
  {
    id: 'river-upstream',
    name: 'Upstream river gauge',
    type: 'River sensor',
    north: 48,
    east: 220,
    unit: 'm',
    value: { normal: 6.6, simulated: 7.8 },
    threshold: 6.4,
    trend: { normal: 0.21, simulated: 0.42 },
  },
  {
    id: 'river-mid',
    name: 'Midstream pressure node',
    type: 'IoT node',
    north: 8,
    east: 380,
    unit: 'kPa',
    value: { normal: 20.5, simulated: 26.8 },
    threshold: 24,
    trend: { normal: 0.24, simulated: 0.47 },
  },
  {
    id: 'weather-east',
    name: 'East weather station',
    type: 'Weather station',
    north: 92,
    east: 560,
    unit: 'mm/h',
    value: { normal: 31, simulated: 44 },
    threshold: 28,
    trend: { normal: 0.33, simulated: 0.58 },
  },
  {
    id: 'satellite-tile',
    name: 'Demo satellite moisture tile',
    type: 'Satellite feed',
    north: 40,
    east: 340,
    unit: '%',
    value: { normal: 84, simulated: 89 },
    threshold: 80,
    trend: { normal: 0.18, simulated: 0.33 },
  },
]

const weatherStationTemplates = [
  {
    name: 'North ridge',
    north: 165,
    east: 80,
    rainfall: { normal: 14, simulated: 32 },
    wind: 12,
    humidity: { normal: 72, simulated: 86 },
  },
  {
    name: 'River bend',
    north: 24,
    east: 300,
    rainfall: { normal: 22, simulated: 42 },
    wind: 10,
    humidity: { normal: 80, simulated: 92 },
  },
  {
    name: 'Harbor road',
    north: -40,
    east: 520,
    rainfall: { normal: 28, simulated: 49 },
    wind: 18,
    humidity: { normal: 86, simulated: 95 },
  },
]

const riverPathOffsets = [
  { north: 120, east: -150 },
  { north: 92, east: 40 },
  { north: 55, east: 185 },
  { north: 18, east: 360 },
  { north: 4, east: 540 },
  { north: 20, east: 730 },
]

const floodCenterOffset = { north: 26, east: 385 }

const scenarioProfiles = {
  normal: {
    name: 'baseline',
    baseRisk: 14,
    rainfall: 14,
    riverLevel: 5.2,
    satelliteMoisture: 58,
    confidence: 0.91,
    floodRadius: 360,
    floodGrowth: [0, 10, 20, 32, 44, 56],
    surgeBonus: 0,
    forecastRisk: [26, 42, 57, 72, 79, 84],
  },
  simulated: {
    name: 'surge',
    baseRisk: 30,
    rainfall: 32,
    riverLevel: 6.9,
    satelliteMoisture: 86,
    confidence: 0.82,
    floodRadius: 540,
    floodGrowth: [0, 24, 44, 68, 92, 118],
    surgeBonus: 10,
    forecastRisk: [42, 60, 75, 87, 94, 97],
  },
}

export function buildDemoRegion(anchor = demoCenterFallback) {
  const nodeMap = new Map()

  const nodes = nodeTemplates.map((node) => {
    const latlng = offsetLatLng(anchor, node.north, node.east)
    const value = { ...node, latlng }
    nodeMap.set(node.id, value)
    return value
  })

  const edges = edgeTemplates.map(([from, to], index) => {
    const a = nodeMap.get(from)
    const b = nodeMap.get(to)
    const labelKey =
      (from === 'home' && to === 'market') ||
      (from === 'market' && to === 'canal') ||
      (from === 'canal' && to === 'bridge') ||
      (from === 'bridge' && to === 'central_approach')
        ? 'lowlandCorridor'
        : 'elevatedConnector'

    return {
      id: `edge-${index}-${from}-${to}`,
      from,
      to,
      coordinates: [a.latlng, b.latlng],
      labelKey,
    }
  })

  const shelters = shelterTemplates.map((shelter) => {
    const node = nodeMap.get(shelter.nodeId)
    return {
      ...shelter,
      latlng: node.latlng,
      node,
    }
  })

  const sensors = sensorTemplates.map((sensor) => ({
    ...sensor,
    latlng: offsetLatLng(anchor, sensor.north, sensor.east),
  }))

  const weatherStations = weatherStationTemplates.map((station) => ({
    ...station,
    latlng: offsetLatLng(anchor, station.north, station.east),
  }))

  const riverPath = riverPathOffsets.map((point) => offsetLatLng(anchor, point.north, point.east))
  const floodCenter = offsetLatLng(anchor, floodCenterOffset.north, floodCenterOffset.east)
  const satelliteCenter = offsetLatLng(anchor, floodCenterOffset.north + 28, floodCenterOffset.east + 38)

  return {
    anchor,
    nodes,
    edges,
    shelters,
    sensors,
    weatherStations,
    riverPath,
    floodCenter,
    satelliteCenter,
  }
}

export function getScenarioProfile(simulated) {
  return simulated ? scenarioProfiles.simulated : scenarioProfiles.normal
}

export function buildForecastSeries({ simulated }) {
  const profile = getScenarioProfile(simulated)
  const riskSeries = profile.forecastRisk ?? forecastWindows.map((_, index) => profile.baseRisk + profile.floodGrowth[index])

  return forecastWindows.map((hours, index) => {
    const growth = profile.floodGrowth[index]
    const rainfall = profile.rainfall + index * (simulated ? 3.0 : 1.2)
    const riverLevel = profile.riverLevel + index * (simulated ? 0.24 : 0.09)
    const confidence = Math.max(0.6, Math.min(0.96, profile.confidence - index * (simulated ? 0.018 : 0.01)))
    const risk = Math.max(0, Math.min(100, riskSeries[index] ?? profile.baseRisk + growth))

    return {
      hours,
      rainfall: Math.round(rainfall),
      riverLevel: Number(riverLevel.toFixed(1)),
      confidence: Number(confidence.toFixed(2)),
      riskGrowth: growth,
      risk: Number(risk.toFixed(1)),
    }
  })
}
