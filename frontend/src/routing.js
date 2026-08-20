import { buildDemoRegion, getScenarioProfile } from './data.js'

const RISK_LEVELS = {
  low: { label: 'LOW', multiplier: 1, color: '#7ea8a0' },
  moderate: { label: 'MODERATE', multiplier: 3, color: '#c9b27d' },
  high: { label: 'HIGH', multiplier: 10, color: '#cf8a8a' },
  critical: { label: 'CRITICAL', multiplier: Number.POSITIVE_INFINITY, color: '#a85a5a' },
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function haversineMeters(a, b) {
  const toRad = (value) => (value * Math.PI) / 180
  const lat1 = a.lat
  const lat2 = b.lat
  const deltaLat = toRad(lat2 - lat1)
  const deltaLng = toRad(b.lng - a.lng)
  const sinLat = Math.sin(deltaLat / 2)
  const sinLng = Math.sin(deltaLng / 2)
  const root =
    sinLat * sinLat +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * sinLng * sinLng
  return 2 * 6371000 * Math.asin(Math.sqrt(root))
}

function localMeters(point, center) {
  const north = (point.lat - center.lat) * 111320
  const east = (point.lng - center.lng) * 111320 * Math.cos((center.lat * Math.PI) / 180)
  return { north, east }
}

function distanceMeters(a, b) {
  return haversineMeters(a, b)
}

export function haversineKm(a, b) {
  return haversineMeters(a, b) / 1000
}

function pointToSegmentDistance(point, start, end) {
  const ax = start.east
  const ay = start.north
  const bx = end.east
  const by = end.north
  const px = point.east
  const py = point.north
  const dx = bx - ax
  const dy = by - ay

  if (dx === 0 && dy === 0) {
    return Math.hypot(px - ax, py - ay)
  }

  const t = clamp(((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy), 0, 1)
  const projectionX = ax + t * dx
  const projectionY = ay + t * dy
  return Math.hypot(px - projectionX, py - projectionY)
}

function distanceToPolyline(point, polyline, center) {
  const localPoint = localMeters(point, center)
  let best = Number.POSITIVE_INFINITY
  for (let index = 0; index < polyline.length - 1; index += 1) {
    const start = localMeters(polyline[index], center)
    const end = localMeters(polyline[index + 1], center)
    best = Math.min(best, pointToSegmentDistance(localPoint, start, end))
  }
  return best
}

function riskMultiplierForLevel(level) {
  return RISK_LEVELS[level].multiplier
}

function classifyRisk(riskScore) {
  if (riskScore >= 82) return 'critical'
  if (riskScore >= 58) return 'high'
  if (riskScore >= 30) return 'moderate'
  return 'low'
}

function buildEdgeMetrics(region, scenario, horizon, simulated) {
  const profile = getScenarioProfile(simulated)
  const horizonIndex = [0, 6, 12, 24, 48, 72].indexOf(horizon)
  const growth = profile.floodGrowth[horizonIndex >= 0 ? horizonIndex : 0]

  return region.edges.map((edge) => {
    const from = region.nodes.find((node) => node.id === edge.from)
    const to = region.nodes.find((node) => node.id === edge.to)
    const midpoint = {
      lat: (from.latlng.lat + to.latlng.lat) / 2,
      lng: (from.latlng.lng + to.latlng.lng) / 2,
    }
    const midpointLocal = localMeters(midpoint, region.anchor)
    const riverDistance = distanceToPolyline(midpoint, region.riverPath, region.anchor)
    const floodDistance = distanceMeters(midpoint, region.floodCenter)
    const highGroundBonus = clamp((midpointLocal.north - 110) / 240, 0, 1)
    const lowGroundPenalty = clamp((95 - midpointLocal.north) / 210, 0, 1)
    const eastPenalty = clamp((midpointLocal.east - 260) / 330, 0, 1)
    const riverInfluence = clamp(1 - riverDistance / (320 + growth * 1.4), 0, 1)
    const floodInfluence = clamp(1 - floodDistance / (520 + growth * 2.5), 0, 1)
    const roadBias = edge.labelKey === 'lowlandCorridor' ? (simulated ? 24 : 14) : -5
    const roadTypePenalty = edge.labelKey === 'lowlandCorridor' ? 9 : 0

    let riskScore =
      profile.baseRisk * 0.22 +
      growth * 0.16 +
      riverInfluence * (simulated ? 20 : 14) +
      floodInfluence * (simulated ? 25 : 18) +
      eastPenalty * 8 +
      lowGroundPenalty * 9 -
      highGroundBonus * 10 +
      roadBias +
      roadTypePenalty +
      (simulated ? profile.surgeBonus * 0.35 : 0)

    riskScore = clamp(riskScore, 0, 100)
    const riskLevel = classifyRisk(riskScore)
    const multiplier = riskMultiplierForLevel(riskLevel)
    const blocked = riskLevel === 'critical'
    const distanceKm = distanceMeters(from.latlng, to.latlng) / 1000
    const edgeCost = blocked ? Number.POSITIVE_INFINITY : distanceKm * multiplier
    const baseSpeed = edge.labelKey === 'lowlandCorridor' ? (simulated ? 30 : 36) : simulated ? 36 : 40
    const speedKmh = clamp(baseSpeed - riskScore * 0.05, 22, 40)

    return {
      ...edge,
      midpoint,
      midpointLocal,
      distanceKm,
      riskScore: Number(riskScore.toFixed(1)),
      riskLevel,
      multiplier,
      blocked,
      edgeCost,
      speedKmh: Number(speedKmh.toFixed(1)),
    }
  })
}

function buildAdjacency(region, edges) {
  const adjacency = new Map(region.nodes.map((node) => [node.id, []]))

  for (const edge of edges) {
    const forward = {
      to: edge.to,
      edgeId: edge.id,
      cost: edge.edgeCost,
      distanceKm: edge.distanceKm,
      riskScore: edge.riskScore,
      riskLevel: edge.riskLevel,
      blocked: edge.blocked,
    }
    const backward = {
      to: edge.from,
      edgeId: edge.id,
      cost: edge.edgeCost,
      distanceKm: edge.distanceKm,
      riskScore: edge.riskScore,
      riskLevel: edge.riskLevel,
      blocked: edge.blocked,
    }

    adjacency.get(edge.from).push(forward)
    adjacency.get(edge.to).push(backward)
  }

  return adjacency
}

function dijkstra(region, edges, sourceId, destinationId, bannedEdgeIds = new Set(), costFn = (edge) => edge.edgeCost) {
  const adjacency = buildAdjacency(
    region,
    edges.filter((edge) => !bannedEdgeIds.has(edge.id)),
  )
  const distances = new Map()
  const previous = new Map()
  const unvisited = new Set(adjacency.keys())

  for (const nodeId of unvisited) {
    distances.set(nodeId, Number.POSITIVE_INFINITY)
  }
  distances.set(sourceId, 0)

  while (unvisited.size > 0) {
    let current = null
    let currentDistance = Number.POSITIVE_INFINITY

    for (const nodeId of unvisited) {
      const candidate = distances.get(nodeId) ?? Number.POSITIVE_INFINITY
      if (candidate < currentDistance) {
        currentDistance = candidate
        current = nodeId
      }
    }

    if (current === null || currentDistance === Number.POSITIVE_INFINITY) {
      break
    }

    unvisited.delete(current)

    if (current === destinationId) {
      break
    }

    for (const neighbor of adjacency.get(current) ?? []) {
      if (!unvisited.has(neighbor.to)) continue
      const edge = edges.find((item) => item.id === neighbor.edgeId)
      const stepCost = edge ? costFn(edge) : neighbor.cost
      const alt = currentDistance + stepCost
      if (alt < (distances.get(neighbor.to) ?? Number.POSITIVE_INFINITY)) {
        distances.set(neighbor.to, alt)
        previous.set(neighbor.to, { nodeId: current, edgeId: neighbor.edgeId })
      }
    }
  }

  const pathNodeIds = []
  const pathEdges = []
  let cursor = destinationId
  if (!previous.has(cursor) && cursor !== sourceId) {
    return null
  }

  while (cursor) {
    pathNodeIds.unshift(cursor)
    const prev = previous.get(cursor)
    if (!prev) break
    const edge = edges.find((item) => item.id === prev.edgeId)
    if (edge) pathEdges.unshift(edge)
    cursor = prev.nodeId
    if (cursor === sourceId) {
      pathNodeIds.unshift(sourceId)
      break
    }
  }

  if (pathNodeIds[0] !== sourceId || pathNodeIds[pathNodeIds.length - 1] !== destinationId) {
    return null
  }

  return {
    pathNodeIds,
    pathEdges,
    totalCost: distances.get(destinationId) ?? Number.POSITIVE_INFINITY,
  }
}

function summarizeRoute(region, route) {
  if (!route) {
    return null
  }

  const distanceKm = route.pathEdges.reduce((sum, edge) => sum + edge.distanceKm, 0)
  const blockedRoads = route.pathEdges.filter((edge) => edge.blocked).length
  const weightedRisk =
    route.pathEdges.reduce((sum, edge) => sum + edge.riskScore * edge.distanceKm, 0) /
    Math.max(distanceKm, 0.001)
  const timeMinutes =
    route.pathEdges.reduce((sum, edge) => sum + (edge.distanceKm / Math.max(edge.speedKmh, 1)) * 60, 0)

  return {
    route: route.pathNodeIds,
    coordinates: route.pathNodeIds.map((nodeId) => region.nodes.find((node) => node.id === nodeId).latlng),
    distance_km: Number(distanceKm.toFixed(1)),
    estimated_time_min: Math.max(1, Math.round(timeMinutes)),
    risk_score: Number(clamp(weightedRisk, 0, 100).toFixed(1)),
    blocked_roads: blockedRoads,
    graph_cost: Number(route.totalCost.toFixed(2)),
    route_cost: Number(route.totalCost.toFixed(2)),
    pathEdges: route.pathEdges,
  }
}

function routeSignature(summary) {
  return summary.route.join('>')
}

function routeDiversity(base, candidate) {
  const baseEdges = new Set(base.pathEdges.map((edge) => edge.id))
  const candidateEdges = new Set(candidate.pathEdges.map((edge) => edge.id))
  const union = new Set([...baseEdges, ...candidateEdges]).size
  let intersection = 0
  for (const edgeId of candidateEdges) {
    if (baseEdges.has(edgeId)) {
      intersection += 1
    }
  }
  return union === 0 ? 0 : 1 - intersection / union
}

function candidateRoutes(region, edges, sourceId, destinationId, maxRoutes = 3) {
  const searchModes = [
    { key: 'balanced', costFn: (edge) => edge.edgeCost },
    { key: 'distance', costFn: (edge) => (edge.blocked ? Number.POSITIVE_INFINITY : edge.distanceKm) },
    {
      key: 'safety',
      costFn: (edge) =>
        edge.blocked ? Number.POSITIVE_INFINITY : edge.distanceKm * (1 + edge.riskScore / 22),
    },
  ]

  const pool = []

  for (const mode of searchModes) {
    const primary = dijkstra(region, edges, sourceId, destinationId, new Set(), mode.costFn)
    if (!primary) continue

    pool.push({ mode: mode.key, summary: summarizeRoute(region, primary) })

    for (let index = 0; index < primary.pathEdges.length; index += 1) {
      const banned = new Set([primary.pathEdges[index].id])
      const alternative = dijkstra(region, edges, sourceId, destinationId, banned, mode.costFn)
      if (!alternative) continue
      pool.push({ mode: mode.key, summary: summarizeRoute(region, alternative) })
    }
  }

  const deduped = new Map()
  for (const item of pool) {
    const signature = routeSignature(item.summary)
    const current = deduped.get(signature)
    if (!current || item.summary.route_cost < current.summary.route_cost) {
      deduped.set(signature, item)
    }
  }

  const candidates = [...deduped.values()].map((item) => ({
    ...item.summary,
    route_mode: item.mode,
  }))

  if (candidates.length === 0) return []

  const distances = candidates.map((candidate) => candidate.distance_km)
  const risks = candidates.map((candidate) => candidate.risk_score)
  const minDistance = Math.min(...distances)
  const maxDistance = Math.max(...distances)
  const minRisk = Math.min(...risks)
  const maxRisk = Math.max(...risks)

  for (const candidate of candidates) {
    const normalizedDistance =
      maxDistance === minDistance ? 0 : (candidate.distance_km - minDistance) / (maxDistance - minDistance)
    const normalizedRisk = maxRisk === minRisk ? 0 : (candidate.risk_score - minRisk) / (maxRisk - minRisk)
    candidate.normalized_distance = Number(normalizedDistance.toFixed(3))
    candidate.normalized_risk = Number(normalizedRisk.toFixed(3))
    candidate.route_cost = Number((0.4 * normalizedDistance + 0.6 * normalizedRisk).toFixed(3))
  }

  const selected = candidates
    .slice()
    .sort((left, right) => {
      if (left.route_cost !== right.route_cost) return left.route_cost - right.route_cost
      if (left.risk_score !== right.risk_score) return left.risk_score - right.risk_score
      return left.distance_km - right.distance_km
    })[0]

  const lowestRiskRoute = candidates
    .slice()
    .sort((left, right) => {
      if (left.risk_score !== right.risk_score) return left.risk_score - right.risk_score
      if (left.distance_km !== right.distance_km) return left.distance_km - right.distance_km
      return left.route_cost - right.route_cost
    })[0]

  const selectedSignature = routeSignature(selected)
  const lowestRiskSignature = routeSignature(lowestRiskRoute)

  const ranked = candidates
    .map((candidate) => ({
      ...candidate,
      route_role:
        routeSignature(candidate) === selectedSignature
          ? 'recommended'
          : routeSignature(candidate) === lowestRiskSignature
            ? 'lowestRisk'
            : 'higherRisk',
      diversity: routeDiversity(selected, candidate),
    }))
    .sort((left, right) => {
      if (routeSignature(left) === selectedSignature) return -1
      if (routeSignature(right) === selectedSignature) return 1
      if (routeSignature(left) === lowestRiskSignature) return -1
      if (routeSignature(right) === lowestRiskSignature) return 1
      if (left.route_cost !== right.route_cost) return left.route_cost - right.route_cost
      if (right.diversity !== left.diversity) return right.diversity - left.diversity
      return left.distance_km - right.distance_km
    })

  return ranked.slice(0, maxRoutes)
}

export function analyzeFloodState({ region, horizon, simulated }) {
  const profile = getScenarioProfile(simulated)
  const horizonIndex = [0, 6, 12, 24, 48, 72].indexOf(horizon)
  const growth = profile.floodGrowth[horizonIndex >= 0 ? horizonIndex : 0]

  return region.nodes.map((node) => {
    const local = localMeters(node.latlng, region.anchor)
    const riverDistance = distanceToPolyline(node.latlng, region.riverPath, region.anchor)
    const floodDistance = distanceMeters(node.latlng, region.floodCenter)
    const northSafety = clamp((local.north - 60) / 220, 0, 1)
    const eastPenalty = clamp((local.east - 210) / 270, 0, 1)
    const southPenalty = clamp((70 - local.north) / 170, 0, 1)
    const riverInfluence = clamp(1 - riverDistance / (210 + growth * 1.6), 0, 1)
    const floodInfluence = clamp(1 - floodDistance / (390 + growth * 2.1), 0, 1)

    let riskScore =
      profile.baseRisk +
      growth * 0.58 +
      riverInfluence * (simulated ? 35 : 24) +
      floodInfluence * (simulated ? 36 : 28) +
      eastPenalty * 12 +
      southPenalty * 11 -
      northSafety * 12 +
      (simulated ? profile.surgeBonus : 0)

    riskScore = clamp(riskScore, 0, 100)

    return {
      ...node,
      riskScore: Number(riskScore.toFixed(1)),
      riskLevel: classifyRisk(riskScore),
    }
  })
}

export function buildFloodZones({ region, horizon, simulated }) {
  const profile = getScenarioProfile(simulated)
  const horizonIndex = [0, 6, 12, 24, 48, 72].indexOf(horizon)
  const growth = profile.floodGrowth[horizonIndex >= 0 ? horizonIndex : 0]
  const baseRadius = profile.floodRadius + growth * (simulated ? 2.7 : 2.05)

  const makeRing = (latlng, radiusMeters, wobbleMeters, points = 18) => {
    const segments = []
    for (let index = 0; index < points; index += 1) {
      const angle = (Math.PI * 2 * index) / points
      const wobble = Math.sin(angle * 3 + growth / 24) * wobbleMeters * 0.45
      const north = Math.cos(angle) * (radiusMeters + wobble)
      const east = Math.sin(angle) * (radiusMeters * 0.86 + wobble * 0.55)
      segments.push([
        latlng.lat + north / 111320,
        latlng.lng + east / (111320 * Math.cos((latlng.lat * Math.PI) / 180)),
      ])
    }
    return segments
  }

  const low = makeRing(region.floodCenter, baseRadius * 1.95, 42)
  const moderate = makeRing(region.floodCenter, baseRadius * 1.45, 34)
  const high = makeRing(region.floodCenter, baseRadius * 1.0, 26)
  const critical = makeRing(region.floodCenter, baseRadius * 0.62, 18)
  const satellite = makeRing(region.satelliteCenter, baseRadius * 1.28, 22)

  return {
    low,
    moderate,
    high,
    critical,
    satellite,
  }
}

export function buildRoadLayers({ region, horizon, simulated }) {
  const profile = getScenarioProfile(simulated)
  const horizonIndex = [0, 6, 12, 24, 48, 72].indexOf(horizon)
  const growth = profile.floodGrowth[horizonIndex >= 0 ? horizonIndex : 0]
  const edgeMetrics = buildEdgeMetrics(region, profile, horizon, simulated)
  const roads = edgeMetrics.map((edge) => ({
    ...edge,
    coordinates: edge.coordinates ?? [
      region.nodes.find((node) => node.id === edge.from).latlng,
      region.nodes.find((node) => node.id === edge.to).latlng,
    ],
  }))

  return roads
}

export function planRoute({
  region,
  sourceId = 'home',
  destinationId,
  horizon,
  simulated,
  maxRoutes = 3,
}) {
  const profile = getScenarioProfile(simulated)
  const edgeMetrics = buildEdgeMetrics(region, profile, horizon, simulated)
  const primary = candidateRoutes(region, edgeMetrics, sourceId, destinationId, maxRoutes)
  const selected = primary[0] ?? null
  const lowestRiskRoute = primary
    .slice()
    .sort((left, right) => {
      if (left.risk_score !== right.risk_score) return left.risk_score - right.risk_score
      if (left.distance_km !== right.distance_km) return left.distance_km - right.distance_km
      return left.route_cost - right.route_cost
    })[0] ?? null

  const recommendation_reason =
    selected && lowestRiskRoute && routeSignature(selected) === routeSignature(lowestRiskRoute)
      ? 'lowestRisk'
      : 'balance'

  return {
    route: selected?.route ?? [],
    coordinates: selected?.coordinates ?? [],
    distance_km: selected?.distance_km ?? 0,
    estimated_time_min: selected?.estimated_time_min ?? 0,
    risk_score: selected?.risk_score ?? 0,
    route_cost: selected?.route_cost ?? 0,
    graph_cost: selected?.graph_cost ?? 0,
    blocked_roads: selected?.blocked_roads ?? 0,
    recommendation_reason,
    alternative_routes: primary.slice(1),
    candidate_routes: primary,
    selectedRoute: selected,
  }
}

export function chooseBestShelter({ region, sourceId = 'home', horizon, simulated }) {
  const shelterRiskByNodeId = new Map(
    analyzeFloodState({ region, horizon, simulated }).map((node) => [node.id, node.riskScore]),
  )

  const routeOptions = region.shelters
    .map((shelter) => {
      const route = planRoute({
        region,
        sourceId,
        destinationId: shelter.nodeId,
        horizon,
        simulated,
        maxRoutes: 3,
      })
      const shelterRisk = shelterRiskByNodeId.get(shelter.nodeId) ?? 0

      return {
        shelter,
        route,
        score:
          route.route.length === 0
            ? Number.POSITIVE_INFINITY
            : route.route_cost * 1.0 +
              route.risk_score * 1.05 +
              shelterRisk * 1.2 +
              route.blocked_roads * 250,
      }
    })
    .sort((left, right) => left.score - right.score)

  return routeOptions[0]
}

export function routeRiskLevel(routeRiskScore) {
  return classifyRisk(routeRiskScore)
}

export function riskLevelMeta(level) {
  return RISK_LEVELS[level]
}

export function getRouteColor(level) {
  return RISK_LEVELS[level]?.color ?? RISK_LEVELS.low.color
}
