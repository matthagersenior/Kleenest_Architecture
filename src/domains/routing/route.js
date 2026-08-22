import { createLiveNetworkService, LIVE_EVENT_TYPES } from '../live/network.js';

export function createRoutingService(client) {
  if (!client) throw new Error('Supabase client is required.');
  const live = createLiveNetworkService(client);
  return Object.freeze({
    async request({ origin, destination, waypoints = [] } = {}) {
      if (!origin || !destination) throw new Error('Origin and destination are required.');
      return { origin, destination, waypoints };
    },
    async start({ locationId = null, route } = {}) {
      if (!route?.origin || !route?.destination) throw new Error('A valid route is required.');
      return live.publish({ type: LIVE_EVENT_TYPES.USER_ROUTE_STARTED, locationId, payload: { route } });
    },
    async approaching({ locationId, route } = {}) {
      return live.publish({ type: LIVE_EVENT_TYPES.USER_APPROACHING_LOCATION, locationId, payload: { route } });
    },
    async arrived({ locationId, route } = {}) {
      return live.publish({ type: LIVE_EVENT_TYPES.USER_ARRIVED, locationId, payload: { route } });
    },
    async departed({ locationId, route } = {}) {
      return live.publish({ type: LIVE_EVENT_TYPES.USER_DEPARTED, locationId, payload: { route } });
    },
  });
}
