import { createLiveNetworkService, LIVE_EVENT_TYPES } from '../live/network.js';
import { createRouteCache } from './cache.js';

const DEFAULT_ROUTER = 'https://router.project-osrm.org';
const GEOCODER = 'https://nominatim.openstreetmap.org/search';

function coordinates(value) {
  if (Array.isArray(value) && value.length >= 2) return [Number(value[0]), Number(value[1])];
  const match = String(value || '').trim().match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
  return match ? [Number(match[2]), Number(match[1])] : null;
}

async function geocode(value) {
  const direct = coordinates(value);
  if (direct) return direct;
  const query = String(value || '').trim();
  if (!query) return null;
  const response = await fetch(`${GEOCODER}?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`Unable to locate “${query}”.`);
  const rows = await response.json();
  if (!rows?.[0]) throw new Error(`Unable to locate “${query}”.`);
  return [Number(rows[0].lon), Number(rows[0].lat)];
}

async function canonicalCoordinates(client, locationId) {
  if (!locationId) return null;
  const { data, error } = await client.from('locations').select('id,latitude,longitude,name,address,city,state').eq('id', locationId).maybeSingle();
  if (error) throw error;
  if (!data || data.latitude == null || data.longitude == null) return null;
  return [Number(data.longitude), Number(data.latitude)];
}

async function buildGeometry(client, { origin, destination, locationId, waypoints = [] }) {
  const start = coordinates(origin) || await geocode(origin);
  const end = (await canonicalCoordinates(client, locationId)) || coordinates(destination) || await geocode(destination);
  const middle = [];
  for (const point of waypoints) middle.push(coordinates(point) || await geocode(point));
  const points = [start, ...middle, end];
  const provider = String(import.meta.env.VITE_ROUTING_PROVIDER_URL || DEFAULT_ROUTER).replace(/\/$/, '');
  const url = `${provider}/route/v1/driving/${points.map(([lon, lat]) => `${lon},${lat}`).join(';')}?overview=full&geometries=geojson&steps=true`;
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('Routing provider could not build this route.');
  const payload = await response.json();
  const selected = payload?.routes?.[0];
  if (!selected) throw new Error('No drivable route was found between those locations.');
  return {
    geometry: selected.geometry,
    distanceMeters: selected.distance,
    durationSeconds: selected.duration,
    distanceKm: Number((selected.distance / 1000).toFixed(2)),
    durationMinutes: Math.max(1, Math.round(selected.duration / 60)),
    steps: selected.legs?.flatMap(leg => leg.steps || []).map(step => ({
      instruction: step.maneuver?.instruction || step.name || 'Continue',
      distanceMeters: step.distance,
      durationSeconds: step.duration,
      location: step.maneuver?.location,
    })) || [],
    provider: 'osrm',
  };
}

export function createRoutingService(client) {
  if (!client) throw new Error('Supabase client is required.');
  const live = createLiveNetworkService(client);
  const cache = createRouteCache();
  const resolveLocationId = (locationId, route) => locationId || route?.locationId || null;
  const withLocation = (route, locationId) => route ? { ...route, locationId } : route;
  const routePayload = (route, resolvedLocationId) => ({ ...route, locationId: resolvedLocationId, requestedAt: new Date().toISOString() });

  return Object.freeze({
    async request({ origin, destination, waypoints = [], locationId = null, routeGeometry = null, offlinePackId = null } = {}) {
      if (!origin || !destination) throw new Error('Origin and destination are required.');
      const geometry = routeGeometry || await buildGeometry(client, { origin, destination, locationId, waypoints });
      const route = {
        origin,
        destination,
        waypoints,
        locationId,
        geometry: geometry.geometry,
        distanceMeters: geometry.distanceMeters,
        distanceKm: geometry.distanceKm,
        durationSeconds: geometry.durationSeconds,
        durationMinutes: geometry.durationMinutes,
        steps: geometry.steps,
        routingProvider: geometry.provider,
        offlinePackId,
      };
      cache.put(route);
      const { data: { user } = {} } = await client.auth.getUser();
      if (user) await live.publish({ type: LIVE_EVENT_TYPES.USER_DIRECTIONS_REQUESTED, locationId, payload: { route: routePayload(route, locationId) } });
      return route;
    },
    async start({ locationId = null, route } = {}) {
      if (!route?.origin || !route?.destination) throw new Error('A valid route is required.');
      const resolvedLocationId = resolveLocationId(locationId, route);
      const nextRoute = withLocation(route, resolvedLocationId);
      cache.put(nextRoute);
      return live.publish({ type: LIVE_EVENT_TYPES.USER_ROUTE_STARTED, locationId: resolvedLocationId, payload: { route: routePayload(nextRoute, resolvedLocationId) } });
    },
    async approaching({ locationId = null, route } = {}) {
      const resolvedLocationId = resolveLocationId(locationId, route);
      return live.publish({ type: LIVE_EVENT_TYPES.USER_APPROACHING_LOCATION, locationId: resolvedLocationId, payload: { route: withLocation(route, resolvedLocationId) } });
    },
    async arrived({ locationId = null, route } = {}) {
      const resolvedLocationId = resolveLocationId(locationId, route);
      return live.publish({ type: LIVE_EVENT_TYPES.USER_ARRIVED, locationId: resolvedLocationId, payload: { route: withLocation(route, resolvedLocationId) } });
    },
    async departed({ locationId = null, route } = {}) {
      const resolvedLocationId = resolveLocationId(locationId, route);
      return live.publish({ type: LIVE_EVENT_TYPES.USER_DEPARTED, locationId: resolvedLocationId, payload: { route: withLocation(route, resolvedLocationId) } });
    },
    cache,
  });
}
