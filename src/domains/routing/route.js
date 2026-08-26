import { createLiveNetworkService, LIVE_EVENT_TYPES } from '../live/network.js';
import { createRouteCache } from './cache.js';

const DEFAULT_ROUTER = 'https://router.project-osrm.org';
const GEOCODERS = [
  { name: 'photon', url: query => `https://photon.komoot.io/api/?limit=1&q=${encodeURIComponent(query)}`, parse: payload => payload?.features?.[0]?.geometry?.coordinates },
  { name: 'nominatim', url: query => `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=us&q=${encodeURIComponent(query)}`, parse: payload => payload?.[0] ? [Number(payload[0].lon), Number(payload[0].lat)] : null },
];
const geocodeCache = new Map();
const GEOCODE_TTL_MS = 24 * 60 * 60 * 1000;

function coordinates(value) {
  if (Array.isArray(value) && value.length >= 2) return [Number(value[0]), Number(value[1])];
  const match = String(value || '').trim().match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
  return match ? [Number(match[2]), Number(match[1])] : null;
}
function validCoordinates(point) { return Array.isArray(point) && point.length >= 2 && Number.isFinite(Number(point[0])) && Number.isFinite(Number(point[1])); }
function queryVariants(value) {
  const query = String(value || '').trim();
  if (!query) return [];
  const variants = [query];
  const normalized = query.replace(/\s+/g, ' ').replace(/,?\s+(MO|Missouri)\s+\d{5}(?:-\d{4})?$/i, ', MO');
  if (normalized !== query) variants.push(normalized);
  return [...new Set(variants)];
}
async function geocode(value) {
  const direct = coordinates(value); if (direct) return direct;
  const variants = queryVariants(value); if (!variants.length) return null;
  const cacheKey = variants[0].toLowerCase();
  const cached = geocodeCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < GEOCODE_TTL_MS) return cached.point;
  for (const query of variants) {
    for (const provider of GEOCODERS) {
      try {
        const response = await fetch(provider.url(query), { headers: { Accept: 'application/json' } });
        if (!response.ok) continue;
        const point = provider.parse(await response.json());
        if (validCoordinates(point)) {
          const normalized = [Number(point[0]), Number(point[1])];
          geocodeCache.set(cacheKey, { point: normalized, timestamp: Date.now() });
          return normalized;
        }
      } catch (_) {}
    }
  }
  throw new Error(`Unable to locate “${variants[0]}”. Try a fuller address, city/state, ZIP code, or coordinates.`);
}
async function canonicalCoordinates(client, locationId) {
  if (!locationId) return null;
  const { data, error } = await client.from('locations').select('id,latitude,longitude').eq('id', locationId).maybeSingle();
  if (error || !data || data.latitude == null || data.longitude == null) return null;
  return [Number(data.longitude), Number(data.latitude)];
}
async function canonicalCoordinatesMany(client, locationIds = []) {
  const ids = [...new Set(locationIds.filter(Boolean).map(String))]; if (!ids.length) return [];
  const { data, error } = await client.from('locations').select('id,latitude,longitude').in('id', ids); if (error) return [];
  const byId = new Map((data || []).filter(row => row.latitude != null && row.longitude != null).map(row => [String(row.id), [Number(row.longitude), Number(row.latitude)]]));
  return ids.map(id => byId.get(id)).filter(Boolean);
}
async function buildGeometry(client, { origin, destination, locationId, stopLocationIds = [], waypoints = [] }) {
  const start = coordinates(origin) || await geocode(origin);
  const explicitStops = [...new Set(stopLocationIds.filter(Boolean).map(String))];
  const selectedId = locationId ? String(locationId) : null;
  const destinationCoordinates = coordinates(destination);
  const stopPoints = await canonicalCoordinatesMany(client, explicitStops);
  const useSelectedAsDestination = Boolean(selectedId && explicitStops.length === 0 && !destinationCoordinates);
  const middle = [...stopPoints]; let end = null;
  if (useSelectedAsDestination) end = await canonicalCoordinates(client, selectedId);
  if (!end && destinationCoordinates) end = destinationCoordinates;
  if (!end && destination) end = await geocode(destination);
  if (!end && middle.length) end = middle.pop();
  if (!end) throw new Error('Choose a destination or restroom stop before building the route.');
  const points = [start, ...middle, ...((end && !middle.includes(end)) ? [end] : [])];
  for (const point of waypoints) points.splice(-1, 0, coordinates(point) || await geocode(point));
  if (points.length < 2) throw new Error('A route needs a starting point and destination.');
  const provider = String(import.meta.env.VITE_ROUTING_PROVIDER_URL || DEFAULT_ROUTER).replace(/\/$/, '');
  const url = `${provider}/route/v1/driving/${points.map(([lon, lat]) => `${lon},${lat}`).join(';')}?overview=full&geometries=geojson&steps=true`;
  const response = await fetch(url, { headers: { Accept: 'application/json' } }); if (!response.ok) throw new Error('Routing provider could not build this route.');
  const payload = await response.json(); const selected = payload?.routes?.[0]; if (!selected) throw new Error('No drivable route was found between those locations.');
  return { geometry: selected.geometry, distanceMeters: selected.distance, durationSeconds: selected.duration, distanceKm: Number((selected.distance / 1000).toFixed(2)), durationMinutes: Math.max(1, Math.round(selected.duration / 60)), steps: selected.legs?.flatMap(leg => leg.steps || []).map(step => ({ instruction: step.maneuver?.instruction || step.name || 'Continue', distanceMeters: step.distance, durationSeconds: step.duration, location: step.maneuver?.location })) || [], provider: 'osrm', waypointCount: Math.max(0, points.length - 2), originCoordinates: start, destinationCoordinates: end, stopCoordinates: stopPoints };
}
export function createRoutingService(client) {
  if (!client) throw new Error('Supabase client is required.');
  const live = createLiveNetworkService(client); const cache = createRouteCache();
  const resolveLocationId = (locationId, route) => locationId || route?.locationId || route?.stopLocationIds?.[route.stopLocationIds.length - 1] || null;
  const withLocation = (route, locationId) => route ? { ...route, locationId } : route;
  const routePayload = (route, resolvedLocationId) => ({ ...route, locationId: resolvedLocationId, requestedAt: new Date().toISOString() });
  return Object.freeze({
    async request({ origin, destination = '', waypoints = [], locationId = null, stopLocationIds = [], routeGeometry = null, offlinePackId = null } = {}) {
      if (!origin || (!destination && !locationId && !stopLocationIds.length && !waypoints.length)) throw new Error('Origin and a destination or restroom stop are required.');
      const geometry = routeGeometry || await buildGeometry(client, { origin, destination, locationId, stopLocationIds, waypoints });
      const resolvedStopIds = [...new Set([...stopLocationIds, ...(locationId && stopLocationIds.length ? [locationId] : [])].filter(Boolean).map(String))];
      const resolvedLocationId = locationId || resolvedStopIds[resolvedStopIds.length - 1] || null;
      const route = { origin, destination: destination || (resolvedLocationId ? `Restroom stop (${resolvedLocationId})` : 'Selected destination'), originCoordinates: geometry.originCoordinates, destinationCoordinates: geometry.destinationCoordinates, stopCoordinates: geometry.stopCoordinates, waypoints, stopLocationIds: resolvedStopIds, locationId: resolvedLocationId, geometry: geometry.geometry, distanceMeters: geometry.distanceMeters, distanceKm: geometry.distanceKm, durationSeconds: geometry.durationSeconds, durationMinutes: geometry.durationMinutes, steps: geometry.steps, waypointCount: geometry.waypointCount, routingProvider: geometry.provider, offlinePackId };
      cache.put(route);
      const { data: { user } = {} } = await client.auth.getUser();
      if (user) await live.publish({ type: LIVE_EVENT_TYPES.USER_DIRECTIONS_REQUESTED, locationId: resolvedLocationId, payload: { route: routePayload(route, resolvedLocationId) } });
      return route;
    },
    async start({ locationId = null, route } = {}) { if (!route?.origin || (!route?.destination && !route?.locationId)) throw new Error('A valid route is required.'); const resolvedLocationId = resolveLocationId(locationId, route); const nextRoute = withLocation(route, resolvedLocationId); cache.put(nextRoute); return live.publish({ type: LIVE_EVENT_TYPES.USER_ROUTE_STARTED, locationId: resolvedLocationId, payload: { route: routePayload(nextRoute, resolvedLocationId) } }); },
    async approaching({ locationId = null, route } = {}) { const resolvedLocationId = resolveLocationId(locationId, route); return live.publish({ type: LIVE_EVENT_TYPES.USER_APPROACHING_LOCATION, locationId: resolvedLocationId, payload: { route: withLocation(route, resolvedLocationId) } }); },
    async arrived({ locationId = null, route } = {}) { const resolvedLocationId = resolveLocationId(locationId, route); return live.publish({ type: LIVE_EVENT_TYPES.USER_ARRIVED, locationId: resolvedLocationId, payload: { route: withLocation(route, resolvedLocationId) } }); },
    async departed({ locationId = null, route } = {}) { const resolvedLocationId = resolveLocationId(locationId, route); return live.publish({ type: LIVE_EVENT_TYPES.USER_DEPARTED, locationId: resolvedLocationId, payload: { route: withLocation(route, resolvedLocationId) } }); },
    cache,
  });
}
