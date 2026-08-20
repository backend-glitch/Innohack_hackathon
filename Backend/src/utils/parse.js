export function parseLatLng(params) {
  const lat = Number(params.get("lat"));
  const lng = Number(params.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { ok: false, message: "Latitude and longitude are required." };
  }
  return { ok: true, lat, lng };
}

export function parseRouteEndpoints(params) {
  const from = params.get("from");
  const to = params.get("to");
  if (!from || !to) {
    return { ok: false, message: "`from` and `to` are required." };
  }
  const fromParts = from.split(",").map(Number);
  const toParts = to.split(",").map(Number);
  if (fromParts.length !== 2 || toParts.length !== 2 || fromParts.some(Number.isNaN) || toParts.some(Number.isNaN)) {
    return { ok: false, message: "`from` and `to` must be comma-separated lat,lng pairs." };
  }
  return {
    ok: true,
    from: { lat: fromParts[0], lng: fromParts[1] },
    to: { lat: toParts[0], lng: toParts[1] }
  };
}
