import { useEffect, useMemo, useState } from 'react'
import {
  CircleMarker,
  LayersControl,
  MapContainer,
  Polygon,
  Popup,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
} from 'react-leaflet'
import { copy, languageLabels } from './i18n.js'
import {
  buildDemoRegion,
  buildForecastSeries,
  demoCenterFallback,
  getScenarioProfile,
} from './data.js'
import { loadDashboardSnapshot } from './services/api.js'
import {
  analyzeFloodState,
  buildFloodZones,
  buildRoadLayers,
  chooseBestShelter,
  haversineKm,
  getRouteColor,
  planRoute,
  routeRiskLevel,
} from './routing.js'
import 'leaflet/dist/leaflet.css'

const { BaseLayer, Overlay } = LayersControl

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function MapViewSync({ center, zoom }) {
  const map = useMap()

  useEffect(() => {
    map.setView(center, zoom, { animate: true })
  }, [center, map, zoom])

  return null
}

function MetricCard({ label, value, sublabel, tone = 'teal' }) {
  const toneClass = tone === 'advisory' ? 'teal' : tone
  return (
    <div className={`metric-card metric-${toneClass}`}>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      {sublabel ? <div className="metric-sublabel">{sublabel}</div> : null}
    </div>
  )
}

function ForecastPill({ item, active, onClick, text }) {
  return (
    <button className={`forecast-pill ${active ? 'active' : ''}`} onClick={onClick}>
      <span className="forecast-pill-label">{item.label}</span>
      <span className="forecast-pill-risk">{Math.round(item.risk)}%</span>
      <span className="forecast-pill-meta">
        {item.rainfall} {text.units.mmHr}
      </span>
    </button>
  )
}

function SensorBar({ value, threshold, trend }) {
  const ratio = clamp((value / threshold) * 100, 8, 100)
  return (
    <div className="sensor-bar">
      <div className="sensor-bar-track">
        <div className="sensor-bar-fill" style={{ width: `${ratio}%` }} />
      </div>
      <div className="sensor-bar-meta">
        <span>{value}</span>
        <span>
          {trend >= 0 ? '↗' : '↘'} {Math.abs(trend).toFixed(2)}
        </span>
      </div>
    </div>
  )
}

function MapLegendItem({ color, label }) {
  return (
    <span className="map-legend-item">
      <i style={{ background: color }} />
      {label}
    </span>
  )
}

function classifySeverity(value, threshold) {
  const ratio = value / Math.max(threshold, 1)
  if (ratio < 0.85) return 'low'
  if (ratio < 1.05) return 'moderate'
  if (ratio < 1.25) return 'high'
  return 'critical'
}

function severityColor(severity) {
  if (severity === 'critical') return '#d65f5f'
  if (severity === 'high') return '#cf8a8a'
  if (severity === 'moderate') return '#c5a56f'
  return '#6eaea1'
}

function MapContent({
  region,
  roadLayers,
  floodZones,
  routePlan,
  alternativeRoutes,
  sensors,
  weatherStations,
  shelters,
  anchorLocation,
  locationMode,
  selectedShelterId,
  recommendedShelterId,
  onSelectShelter,
  text,
}) {
  const routeLevel = routeRiskLevel(routePlan.risk_score)
  const routeColor = getRouteColor(routeLevel)

  return (
    <MapContainer
      center={anchorLocation}
      zoom={16}
      scrollWheelZoom
      className="leaflet-map"
      zoomControl
    >
      <MapViewSync center={anchorLocation} zoom={16} />

      <LayersControl position="topright">
        <BaseLayer checked name="OpenStreetMap">
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </BaseLayer>

        <Overlay checked name={text.floodZones}>
          <>
            <Polygon
              positions={floodZones.low}
              pathOptions={{ color: '#b5d3e6', fillColor: '#dbeaf4', weight: 1, fillOpacity: 0.18 }}
            />
            <Polygon
              positions={floodZones.moderate}
              pathOptions={{ color: '#8ebcd6', fillColor: '#bcd8ea', weight: 1, fillOpacity: 0.22 }}
            />
            <Polygon
              positions={floodZones.high}
              pathOptions={{ color: '#d3a973', fillColor: '#e5c794', weight: 1.25, fillOpacity: 0.26 }}
            />
            <Polygon
              positions={floodZones.critical}
              pathOptions={{ color: '#d77c7c', fillColor: '#e7bcbc', weight: 1.5, fillOpacity: 0.3 }}
            />
          </>
        </Overlay>

        <Overlay checked name={text.satelliteLayer}>
          <Polygon
            positions={floodZones.satellite}
            pathOptions={{
              color: '#caa96a',
              dashArray: '6 8',
              fillColor: '#ead7a8',
              fillOpacity: 0.12,
              weight: 1.5,
            }}
          />
        </Overlay>

        <Overlay checked name={text.roadNetwork}>
          <>
            {roadLayers.map((road) => {
              const roadColor =
                road.riskLevel === 'critical'
                  ? '#d77c7c'
                  : road.riskLevel === 'high'
                    ? '#cf8a8a'
                    : road.riskLevel === 'moderate'
                      ? '#c5a56f'
                      : '#8fa6ba'

              return (
                <Polyline
                  key={road.id}
                  positions={road.coordinates}
                  pathOptions={{
                    color: roadColor,
                    dashArray: road.blocked ? '10 10' : road.riskLevel === 'high' ? '6 6' : undefined,
                    opacity: road.blocked ? 0.95 : 0.72,
                    weight: road.blocked ? 6 : road.riskLevel === 'critical' ? 5 : 4,
                  }}
                >
                  <Tooltip direction="center" sticky>
                    {text.roadLabels[road.labelKey] ?? road.labelKey} | {text.riskLabels[road.riskLevel.toLowerCase()] ?? road.riskLevel}
                  </Tooltip>
                  <Popup>
                    <div className="map-popup">
                      <strong>{text.roadLabels[road.labelKey] ?? road.labelKey}</strong>
                      <div>
                        {text.routeRisk}: {Math.round(road.riskScore)}%
                      </div>
                      <div>
                        {text.routeCost}: {road.edgeCost === Number.POSITIVE_INFINITY ? '∞' : road.edgeCost.toFixed(2)}
                      </div>
                      <div>{road.blocked ? text.blockedRoads : text.mapLegend.route}</div>
                    </div>
                  </Popup>
                </Polyline>
              )
            })}
          </>
        </Overlay>

        <Overlay checked name={text.hazardLayer}>
          <>
            {roadLayers
              .filter((road) => road.blocked || road.riskLevel === 'critical' || road.riskLevel === 'high')
              .map((road) => (
                <Polyline
                  key={`hazard-${road.id}`}
                  positions={road.coordinates}
                  pathOptions={{
                    color: road.riskLevel === 'critical' ? '#d65f5f' : '#d3a45f',
                    dashArray: '12 9',
                    opacity: 0.9,
                    weight: 7,
                  }}
                />
              ))}
          </>
        </Overlay>

        <Overlay checked name={text.sensorsLayer}>
          <>
            {sensors.map((sensor) => (
                <CircleMarker
                  key={sensor.id}
                  center={sensor.latlng}
                  radius={sensor.type === 'Satellite feed' ? 7 : 8}
                  pathOptions={{
                  color: severityColor(sensor.severity),
                  fillColor: sensor.severity === 'low' ? '#d6ebe3' : sensor.severity === 'moderate' ? '#ead7a8' : sensor.severity === 'high' ? '#e4b1b1' : '#d89c9c',
                  fillOpacity: 0.95,
                  weight: 2,
                }}
              >
                <Tooltip direction="top" offset={[0, -6]}>
                  {sensor.name}
                </Tooltip>
                <Popup>
                  <div className="map-popup">
                    <strong>{sensor.name}</strong>
                    <div>{sensor.type}</div>
                    <div>
                      {sensor.value} {sensor.unit}
                    </div>
                    <div>
                      {text.riskLabels[sensor.severity]}
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </>
        </Overlay>

        <Overlay checked name={text.weatherLayer}>
          <>
            {weatherStations.map((station) => (
              <CircleMarker
                key={station.name}
                center={station.latlng}
                radius={9}
                pathOptions={{
                  color: severityColor(station.severity),
                  fillColor: station.severity === 'low' ? '#dfeaf4' : station.severity === 'moderate' ? '#ead7a8' : station.severity === 'high' ? '#e4b1b1' : '#d89c9c',
                  fillOpacity: 0.98,
                  weight: 2,
                }}
              >
                <Tooltip direction="top" offset={[0, -6]}>
                  {station.name}
                </Tooltip>
                <Popup>
                  <div className="map-popup">
                    <strong>{station.name}</strong>
                    <div>
                      {station.rainfall} {text.units.mmHr}
                    </div>
                    <div>
                      {text.wind}: {station.wind} km/h
                    </div>
                    <div>
                      {text.humidity}: {station.humidity}%
                    </div>
                    <div>{text.riskLabels[station.severity]}</div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </>
        </Overlay>

        <Overlay checked name={text.sheltersLayer}>
          <>
            {shelters.map((shelter) => {
              const isSelected = shelter.id === selectedShelterId
              const isRecommended = shelter.id === recommendedShelterId

              return (
                <CircleMarker
                  key={shelter.id}
                  center={shelter.latlng}
                  radius={isSelected ? 11 : 9}
                  pathOptions={{
                    color: isSelected ? '#6eaea1' : isRecommended ? '#caa96a' : '#b0bccc',
                    fillColor: isSelected ? '#d6ebe3' : isRecommended ? '#ead7a8' : '#eef3f7',
                    fillOpacity: 0.98,
                    weight: 2,
                  }}
                  eventHandlers={{
                    click: () => onSelectShelter(shelter.id),
                  }}
                >
                  <Tooltip direction="top" offset={[0, -6]}>
                    {shelter.name}
                  </Tooltip>
                  <Popup>
                    <div className="map-popup">
                      <strong>{shelter.name}</strong>
                      <div>
                        {text.capacity}: {shelter.capacity}
                      </div>
                      <div>
                        {text.occupancy}: {shelter.occupancy}
                      </div>
                      <div>
                        {text.availableSpaces}: {Math.max(0, shelter.capacity - shelter.occupancy)}
                      </div>
                      <div>
                        {text.distance}: {typeof shelter.directDistanceKm === 'number' ? shelter.directDistanceKm.toFixed(1) : '0.0'} {text.units.km}
                      </div>
                      <div>
                        {text.routeRisk}: {typeof shelter.routeRiskScore === 'number' ? Math.round(shelter.routeRiskScore) : 0}%
                      </div>
                      <div>{text.routeAction}</div>
                    </div>
                  </Popup>
                </CircleMarker>
              )
            })}
          </>
        </Overlay>

        <Overlay checked name={text.routeLayer}>
          <>
            {alternativeRoutes.map((route, index) => (
              <Polyline
                key={`alt-${index}`}
                positions={route.coordinates}
                pathOptions={{
                  color: '#aab8c8',
                  dashArray: '8 8',
                  opacity: 0.7,
                  weight: 4,
                }}
              />
            ))}
            {routePlan.coordinates.length > 1 ? (
              <Polyline
                positions={routePlan.coordinates}
                pathOptions={{
                  color: routeColor,
                  weight: 7,
                  opacity: 0.95,
                }}
              >
                <Popup>
                  <div className="map-popup">
                    <strong>{text.recommendedRoute}</strong>
                    <div>
                      {text.routeDistance}: {routePlan.distance_km.toFixed(1)} {text.units.km}
                    </div>
                    <div>
                      {text.travelTime}: {routePlan.estimated_time_min} {text.units.min}
                    </div>
                    <div>
                      {text.routeRisk}: {Math.round(routePlan.risk_score)}%
                    </div>
                  </div>
                </Popup>
              </Polyline>
            ) : null}
          </>
        </Overlay>
      </LayersControl>

      <CircleMarker
        center={anchorLocation}
        radius={11}
        pathOptions={{
          color: '#6eaea1',
          fillColor: '#6eaea1',
          fillOpacity: 1,
          weight: 2,
        }}
      >
        <Tooltip direction="top" offset={[0, -10]}>
          {text.currentLocation}
        </Tooltip>
        <Popup>
          <div className="map-popup">
            <strong>{text.currentLocation}</strong>
            <div>{locationMode === 'live' ? text.locationLive : text.locationDemo}</div>
          </div>
        </Popup>
      </CircleMarker>

      <div className="leaflet-map-legend">
        <MapLegendItem color="#dbeaf4" label={text.mapLegend.low} />
        <MapLegendItem color="#bcd8ea" label={text.mapLegend.moderate} />
        <MapLegendItem color="#e5c794" label={text.mapLegend.high} />
        <MapLegendItem color="#e7bcbc" label={text.mapLegend.critical} />
        <MapLegendItem color="#6eaea1" label={text.mapLegend.location} />
      </div>
    </MapContainer>
  )
}

function App() {
  const [language, setLanguage] = useState('en')
  const [simulated, setSimulated] = useState(false)
  const [selectedHorizon, setSelectedHorizon] = useState(24)
  const [selectedShelterId, setSelectedShelterId] = useState(null)
  const [anchorLocation, setAnchorLocation] = useState(demoCenterFallback)
  const [locationMode, setLocationMode] = useState('demo')
  const [serviceSnapshot, setServiceSnapshot] = useState(null)

  const text = copy[language]
  const region = useMemo(() => buildDemoRegion(anchorLocation), [anchorLocation])
  const activeRegion = serviceSnapshot?.region ?? region
  const profile = getScenarioProfile(simulated)
  const forecastSeries = serviceSnapshot?.prediction ?? buildForecastSeries({ simulated })
  const selectedForecast = forecastSeries.find((item) => item.hours === selectedHorizon) ?? forecastSeries[0]
  const floodNodes = useMemo(
    () => analyzeFloodState({ region: activeRegion, horizon: selectedHorizon, simulated }),
    [activeRegion, selectedHorizon, simulated],
  )
  const shelterRiskByNodeId = useMemo(
    () => new Map(floodNodes.map((node) => [node.id, node.riskScore])),
    [floodNodes],
  )
  const floodZones =
    serviceSnapshot?.riskZones ?? buildFloodZones({ region: activeRegion, horizon: selectedHorizon, simulated })
  const roadLayers =
    serviceSnapshot?.route?.candidate_routes?.length
      ? buildRoadLayers({ region: activeRegion, horizon: selectedHorizon, simulated })
      : buildRoadLayers({ region: activeRegion, horizon: selectedHorizon, simulated })

  const sensorFeed = useMemo(
    () =>
      activeRegion.sensors.map((sensor) => {
        const value = sensor.value[simulated ? 'simulated' : 'normal']
        const trend = sensor.trend[simulated ? 'simulated' : 'normal']
        return {
          ...sensor,
          value,
          trend,
          severity: classifySeverity(value, sensor.threshold),
        }
      }),
    [activeRegion, simulated],
  )

  const weatherFeed = useMemo(
    () =>
      activeRegion.weatherStations.map((station) => {
        const rainfall = station.rainfall[simulated ? 'simulated' : 'normal']
        const humidity = station.humidity[simulated ? 'simulated' : 'normal']
        return {
          ...station,
          rainfall,
          humidity,
          severity: classifySeverity(rainfall, 24),
        }
      }),
    [activeRegion, simulated],
  )

  const bestShelter = useMemo(
    () => chooseBestShelter({ region: activeRegion, sourceId: 'home', horizon: selectedHorizon, simulated }),
    [activeRegion, selectedHorizon, simulated],
  )

  const shelterRoutes = useMemo(() => {
    return activeRegion.shelters.map((shelter) => {
      const directDistanceKm = haversineKm(anchorLocation, shelter.latlng)
      const route = planRoute({
        region: activeRegion,
        sourceId: 'home',
        destinationId: shelter.nodeId,
        horizon: selectedHorizon,
        simulated,
        maxRoutes: 3,
      })

      return {
        shelter,
        directDistanceKm,
        route,
        shelterRiskScore: shelterRiskByNodeId.get(shelter.nodeId) ?? route.risk_score,
      }
    })
  }, [activeRegion, anchorLocation.lat, anchorLocation.lng, selectedHorizon, simulated, shelterRiskByNodeId])

  const activeShelter =
    activeRegion.shelters.find((shelter) => shelter.id === selectedShelterId) ?? bestShelter.shelter

  const routePlan =
    serviceSnapshot?.route ??
    planRoute({
      region: activeRegion,
      sourceId: 'home',
      destinationId: activeShelter.nodeId,
      horizon: selectedHorizon,
      simulated,
      maxRoutes: 3,
    })

  const routeLevel = routeRiskLevel(routePlan.risk_score)
  const routeLevelLabel = text.riskLabels[routeLevel] ?? routeLevel.toUpperCase()
  const serviceModeLabel = serviceSnapshot?.mode === 'api-ready' ? text.apiReady : text.demoDataLabel
  const routeRecommendationText =
    routePlan.recommendation_reason === 'lowestRisk'
      ? text.routeReasons.lowestRisk
      : text.routeReasons.balance

  const baselineRoute = useMemo(
    () =>
      planRoute({
        region: activeRegion,
        sourceId: 'home',
        destinationId: activeShelter.nodeId,
        horizon: selectedHorizon,
        simulated: false,
        maxRoutes: 3,
      }),
    [activeRegion, activeShelter.nodeId, selectedHorizon],
  )

  const routeChanged = JSON.stringify(routePlan.route) !== JSON.stringify(baselineRoute.route)

  const selectedForecastLabel =
    selectedHorizon === 0
      ? text.now
      : selectedHorizon === 6
        ? text.h6
        : selectedHorizon === 12
          ? text.h12
          : selectedHorizon === 24
            ? text.h24
            : selectedHorizon === 48
              ? text.h48
              : text.h72

  const riskSeverity =
    selectedForecast.risk >= 82 ? 'emergency' : selectedForecast.risk >= 58 ? 'warning' : 'advisory'
  const riskDescription = text.severityDetail[riskSeverity]
  const locationStatus = locationMode === 'live' ? text.locationLive : text.locationDemo

  useEffect(() => {
    let alive = true

    loadDashboardSnapshot({
      regionOrCenter: anchorLocation,
      horizon: selectedHorizon,
      simulated,
      selectedShelterId,
      sourceId: 'home',
      language,
    })
      .then((snapshot) => {
        if (alive) {
          setServiceSnapshot(snapshot)
        }
      })
      .catch(() => {
        if (alive) {
          setServiceSnapshot({
            mode: 'demo',
            region,
            sensors: region.sensors,
            shelters: region.shelters,
            alerts: [],
            riskZones: buildFloodZones({ region, horizon: selectedHorizon, simulated }),
            prediction: buildForecastSeries({ simulated }),
            route: planRoute({
              region,
              sourceId: 'home',
              destinationId: activeShelter.nodeId,
              horizon: selectedHorizon,
              simulated,
              maxRoutes: 3,
            }),
          })
        }
      })

    return () => {
      alive = false
    }
  }, [
    anchorLocation.lat,
    anchorLocation.lng,
    region,
    selectedHorizon,
    selectedShelterId,
    simulated,
    activeShelter.nodeId,
  ])

  useEffect(() => {
    let alive = true

    if (!navigator.geolocation) {
      setLocationMode('demo')
      return undefined
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!alive) return
        setAnchorLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setLocationMode('live')
      },
      () => {
        if (!alive) return
        setAnchorLocation(demoCenterFallback)
        setLocationMode('demo')
      },
      { enableHighAccuracy: true, timeout: 7000, maximumAge: 60000 },
    )

    return () => {
      alive = false
    }
  }, [])

  return (
    <div className={`app-shell severity-${riskSeverity}`}>
      <div className="glow glow-one" />
      <div className="glow glow-two" />

      <header className="topbar">
        <div>
          <div className="eyebrow">{serviceModeLabel}</div>
          <h1>{text.appName}</h1>
          <p>{text.appTagline}</p>
        </div>

        <div className="topbar-actions">
          <div className="language-switcher" role="tablist" aria-label="Language selector">
            {Object.entries(languageLabels).map(([code, label]) => (
              <button
                key={code}
                className={`lang-chip ${language === code ? 'active' : ''}`}
                onClick={() => setLanguage(code)}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            className={`toggle-button ${simulated ? 'active' : ''}`}
            onClick={() => {
              setSimulated((current) => !current)
              setSelectedHorizon(24)
            }}
          >
            {simulated ? text.simulateOff : text.simulateOn}
          </button>
          <button className="ghost-button" onClick={() => setAnchorLocation(demoCenterFallback)}>
            {text.useDemoLocation}
          </button>
        </div>
      </header>

      <main className="dashboard">
        <section className="hero panel">
          <div className="hero-copy">
            <div className={`alert-badge alert-${riskSeverity}`}>
              {text[riskSeverity]}
            </div>
            <h2>{text.riskExplanation}</h2>
            <p>{riskDescription}</p>
            <div className="hero-actions">
              <button className="primary-button" onClick={() => setAnchorLocation(demoCenterFallback)}>
                {text.useDemoLocation}
              </button>
              <div className="status-chip">
                {locationStatus}
                {locationMode !== 'live' ? (
                  <>
                    <span aria-hidden="true">•</span>
                    {text.locationFallback}
                  </>
                ) : null}
              </div>
            </div>
          </div>

          <div className="hero-metrics">
            <MetricCard
              label={text.currentRisk}
              value={`${Math.round(selectedForecast.risk)}%`}
              sublabel={`${text.confidence}: ${Math.round(selectedForecast.confidence * 100)}%`}
              tone={riskSeverity}
            />
            <MetricCard
              label={text.rainfall}
              value={`${selectedForecast.rainfall} ${text.units.mmHr}`}
              sublabel={selectedForecastLabel}
            />
            <MetricCard
              label={text.riverLevel}
              value={`${selectedForecast.riverLevel.toFixed(1)} ${text.units.m}`}
              sublabel={selectedForecast.risk >= 82 ? text.emergency : text.advisory}
            />
            <MetricCard
              label={text.satelliteSignal}
              value={`${profile.satelliteMoisture}${text.units.percent}`}
              sublabel={text.demoSatellite}
            />
          </div>
        </section>

        <section className="timeline panel">
          <div className="panel-header">
            <div>
              <h3>{text.predictionTitle}</h3>
              <p>{text.overviewTitle}</p>
            </div>
            <div className="timeline-summary">
              <span>{text.safetyScore}</span>
              <strong>{Math.max(0, 100 - Math.round(selectedForecast.risk))}%</strong>
            </div>
          </div>

          <div className="forecast-strip">
            {forecastSeries.map((item) => {
              const label =
                item.hours === 0
                  ? text.now
                  : item.hours === 6
                    ? text.h6
                    : item.hours === 12
                      ? text.h12
                      : item.hours === 24
                        ? text.h24
                        : item.hours === 48
                          ? text.h48
                          : text.h72

              return (
                <ForecastPill
                  key={item.hours}
                  item={{ ...item, label }}
                  active={item.hours === selectedHorizon}
                  onClick={() => setSelectedHorizon(item.hours)}
                  text={text}
                />
              )
            })}
          </div>
        </section>

        <section className="map-panel panel">
          <div className="panel-header">
            <div>
              <h3>{text.mapTitle}</h3>
              <p>{text.mapLegend.route}</p>
            </div>
            <div className="map-status">
              <span className={`status-dot ${riskSeverity}`} />
              <span>{serviceModeLabel}</span>
            </div>
          </div>

          <div className="map-frame">
            <MapContent
              region={activeRegion}
              roadLayers={roadLayers}
              floodZones={floodZones}
              routePlan={routePlan}
              alternativeRoutes={routePlan.alternative_routes}
              sensors={sensorFeed}
              weatherStations={weatherFeed}
              shelters={shelterRoutes.map(({ shelter, directDistanceKm, route }) => ({
                ...shelter,
                directDistanceKm,
                routeRiskScore: shelterRiskByNodeId.get(shelter.nodeId) ?? route.risk_score,
                routeDistanceKm: route.distance_km,
              }))}
              anchorLocation={anchorLocation}
              locationMode={locationMode}
              selectedShelterId={activeShelter.id}
              recommendedShelterId={bestShelter.shelter.id}
              onSelectShelter={setSelectedShelterId}
              text={text}
            />
          </div>
        </section>

        <section className="route-panel panel">
          <div className="panel-header">
            <div>
              <h3>{text.routeTitle}</h3>
              <p>{routeChanged || simulated ? text.routeShifted : text.routeStable}</p>
            </div>
            <button
              className="ghost-button"
              onClick={() => setSelectedShelterId(null)}
              disabled={selectedShelterId === null}
            >
              {text.selectRoute}
            </button>
          </div>

          <div className="route-summary">
            <div>
              <span>{text.routeDistance}</span>
              <strong>
                {routePlan.distance_km.toFixed(1)} {text.units.km}
              </strong>
            </div>
            <div>
              <span>{text.travelTime}</span>
              <strong>
                {routePlan.estimated_time_min} {text.units.min}
              </strong>
            </div>
            <div>
              <span>{text.routeRisk}</span>
              <strong>{Math.round(routePlan.risk_score)}%</strong>
            </div>
          </div>

          <div className="route-callout">
            <span>{text.recommendedRoute}</span>
            <strong>{activeShelter.name}</strong>
            <p>{routeRecommendationText}</p>
            <p>{text.routeDisclaimer}</p>
          </div>

          <div className="route-badges">
            <span className="mini-chip">
              {routePlan.blocked_roads > 0 ? `${routePlan.blocked_roads} ${text.blockedRoads}` : text.low}
            </span>
            <span className="mini-chip">{routeLevelLabel}</span>
            <span className="mini-chip">{serviceModeLabel}</span>
          </div>

          <div className="alternative-route-list">
            <div className="section-label">{text.alternativeRoutes}</div>
            {routePlan.candidate_routes.map((candidate, index) => {
              const routeLabel =
                index === 0 ? text.routeCards.routeA : index === 1 ? text.routeCards.routeB : text.routeCards.routeC
              const candidateStatus =
                candidate.route_role === 'recommended'
                  ? text.recommendedRoute
                  : candidate.route_role === 'lowestRisk'
                    ? text.routeCards.lowestRisk
                    : text.routeCards.higherRisk
              const isRecommended = candidate.route_role === 'recommended'

              return (
                <button
                  key={`${candidate.route.join('-')}-${index}`}
                  className={`candidate-route ${isRecommended ? 'selected' : ''}`}
                  onClick={() => setSelectedShelterId(activeShelter.id)}
                >
                  <div className="candidate-route-head">
                    <strong>{routeLabel}</strong>
                    <span>{candidateStatus}</span>
                  </div>
                  <div className="candidate-route-stats">
                    <span>
                      {candidate.distance_km.toFixed(1)} {text.units.km}
                    </span>
                    <span>
                      {candidate.estimated_time_min} {text.units.min}
                    </span>
                    <span>{Math.round(candidate.risk_score)}%</span>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <section className="shelter-panel panel">
          <div className="panel-header">
            <div>
              <h3>{text.shelterTitle}</h3>
              <p>{text.chooseShelter}</p>
            </div>
            <div className="panel-subtle">{text.shelterNote}</div>
          </div>

          <div className="shelter-list">
            {shelterRoutes.map(({ shelter, route, directDistanceKm, shelterRiskScore }) => {
              const availableSpaces = Math.max(0, shelter.capacity - shelter.occupancy)
              const occupancyPercent = Math.round((shelter.occupancy / shelter.capacity) * 100)
              const isSelected = shelter.id === activeShelter.id
              const isRecommended = shelter.id === bestShelter.shelter.id

              return (
                <button
                  key={shelter.id}
                  className={`shelter-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedShelterId(shelter.id)}
                >
                  <div className="shelter-card-top">
                    <strong>{shelter.name}</strong>
                    <span className={`shelter-status ${isSelected ? 'active' : ''}`}>
                      {isSelected ? text.shelterCards.selected : isRecommended ? text.shelterCards.recommended : text.open}
                    </span>
                  </div>
                  <div className="shelter-stats">
                    <span>
                      {text.capacity}: {shelter.capacity}
                    </span>
                    <span>
                      {text.occupancy}: {shelter.occupancy}
                    </span>
                    <span>
                      {text.availableSpaces}: {availableSpaces}
                    </span>
                    <span>
                      {text.distance}: {directDistanceKm.toFixed(1)} {text.units.km}
                    </span>
                  </div>
                  <div className="occupancy-bar">
                    <div className="occupancy-fill" style={{ width: `${occupancyPercent}%` }} />
                  </div>
                  <div className="shelter-footer">
                    <span>{text.shelterNote}</span>
                    <span>
                      {Math.round(shelterRiskScore)}% {text.routeRisk}
                    </span>
                  </div>
                  <div className="route-action">{text.routeAction}</div>
                </button>
              )
            })}
          </div>
        </section>

        <section className="sensor-panel panel">
          <div className="panel-header">
            <div>
              <h3>{text.sensorTitle}</h3>
              <p>{text.sensorDetails}</p>
            </div>
            <div className="panel-subtle">{text.demoDataLabel}</div>
          </div>

          <div className="sensor-grid">
            {sensorFeed.map((sensor) => {
              return (
                <div key={sensor.id} className="sensor-card">
                  <div className="sensor-card-head">
                    <div>
                      <strong>{sensor.name}</strong>
                      <p>{sensor.type}</p>
                    </div>
                    <div className={`sensor-tone ${sensor.severity}`}>
                      {text.riskLabels[sensor.severity]}
                    </div>
                  </div>
                  <SensorBar value={sensor.value} threshold={sensor.threshold} trend={sensor.trend} />
                </div>
              )
            })}
          </div>

          <div className="weather-strip">
            {weatherFeed.map((station) => (
              <div key={station.name} className="weather-chip">
                <strong>{station.name}</strong>
                <span>
                  {station.rainfall} {text.units.mmHr}
                </span>
                <span>
                  {text.wind}: {station.wind} km/h
                </span>
                <span>
                  {text.humidity}: {station.humidity}%
                </span>
                <span className={`sensor-tone ${station.severity}`}>{text.riskLabels[station.severity]}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="warning-panel panel">
          <div className="panel-header">
            <div>
              <h3>{text.warningTitle}</h3>
              <p>{text.floodDetails}</p>
            </div>
            <div className={`alert-badge alert-${riskSeverity}`}>{text[riskSeverity]}</div>
          </div>

          <div className="warning-copy">
            <p>{riskDescription}</p>
            <ul>
              <li>
                {text.selectedTime}: {selectedForecastLabel}
              </li>
              <li>
                {text.currentLocation}: {locationStatus}
              </li>
              <li>
                {text.recommendedRoute}: {activeShelter.name}
              </li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
