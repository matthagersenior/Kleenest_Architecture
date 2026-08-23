import { createLiveNetworkService, LIVE_EVENT_TYPES } from '../live/network.js';
import { createRouteCache } from './cache.js';

export function createRoutingService(client) {
  if (!client) throw new Error('Supabase client is required.');
  const live = createLiveNetworkService(client);
  const cache = createRouteCache();
  const resolveLocationId = (locationId, route) => locationId || route?.locationId || null;
  const withLocation = (route, locationId) => route ? { ...route, locationId } : route;
  return Object.freeze({
    async request({ origin, destination, waypoints = [], locationId = null } = {}) {
      if (!origin || !destination) throw new Error('Origin and destination are required.');
      const route = { origin, destination, waypoints, locationId };
      await live.publish({ type: LIVE_EVENT_TYPES.USER_DIRECTIONS_REQUESTED, locationId, payload: { route } });
      return cache.put(route);
    },
    async start({ locationId = null, route } = {}) {
      if (!route?.origin || !route?.destination) throw new Error('A valid route is required.');
      const resolvedLocationId = resolveLocationId(locationId, route);
      const nextRoute = withLocation(route, resolvedLocationId);
      cache.put(nextRoute);
      return live.publish({ type: LIVE_EVENT_TYPES.USER_ROUTE_STARTED, locationId: resolvedLocationId, payload: { route: nextRoute } });
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
