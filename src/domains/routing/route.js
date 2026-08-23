import { createLiveNetworkService, LIVE_EVENT_TYPES } from '../live/network.js';
import { createRouteCache } from './cache.js';

export function createRoutingService(client) {
  if (!client) throw new Error('Supabase client is required.');
  const live = createLiveNetworkService(client);
  const cache = createRouteCache();
  return Object.freeze({
    async request({ origin, destination, waypoints = [], locationId = null } = {}) {
      if (!origin || !destination) throw new Error('Origin and destination are required.');
      const route = { origin, destination, waypoints, locationId: locationId || null };
      await live.publish({ type: LIVE_EVENT_TYPES.USER_DIRECTIONS_REQUESTED, locationId: locationId || null, payload: { route } });
      return cache.put(route);
    },
    async start({ locationId = null, route } = {}) {
      if (!route?.origin || !route?.destination) throw new Error('A valid route is required.');
      const resolvedLocationId = locationId || route.locationId || null;
      const nextRoute = { ...route, locationId: resolvedLocationId };
      cache.put(nextRoute);
      return live.publish({ type: LIVE_EVENT_TYPES.USER_ROUTE_STARTED, locationId: resolvedLocationId, payload: { route: nextRoute } });
    },
    async approaching({ locationId = null, route } = {}) {
      const resolvedLocationId = locationId || route?.locationId || null;
      return live.publish({ type: LIVE_EVENT_TYPES.USER_APPROACHING_LOCATION, locationId: resolvedLocationId, payload: { route } });
    },
    async arrived({ locationId = null, route } = {}) {
      const resolvedLocationId = locationId || route?.locationId || null;
      return live.publish({ type: LIVE_EVENT_TYPES.USER_ARRIVED, locationId: resolvedLocationId, payload: { route } });
    },
    async departed({ locationId = null, route } = {}) {
      const resolvedLocationId = locationId || route?.locationId || null;
      return live.publish({ type: LIVE_EVENT_TYPES.USER_DEPARTED, locationId: resolvedLocationId, payload: { route } });
    },
    cache,
  });
}
