import { LIVE_EVENT_TYPES } from './network.js';

const ROUTE_EVENTS = new Set([
  LIVE_EVENT_TYPES.USER_DIRECTIONS_REQUESTED,
  LIVE_EVENT_TYPES.USER_ROUTE_STARTED,
  LIVE_EVENT_TYPES.USER_APPROACHING_LOCATION,
  LIVE_EVENT_TYPES.USER_ARRIVED,
  LIVE_EVENT_TYPES.USER_DEPARTED,
]);

export function classifyLiveEvent(event) {
  if (!event?.event_type) return 'unknown';
  if (ROUTE_EVENTS.has(event.event_type)) return 'route';
  if (event.event_type.startsWith('fleet.')) return 'fleet';
  if (event.event_type.startsWith('location.')) return 'location';
  if (event.event_type === LIVE_EVENT_TYPES.BUSINESS_OFFER_STARTED) return 'business';
  return 'activity';
}

export function reduceRouteFeedback(events = []) {
  return events.filter(event => ROUTE_EVENTS.has(event?.event_type)).reduce((state, event) => ({
    ...state,
    lastEvent: event,
    lastEventType: event.event_type,
    locationId: event.location_id ?? state.locationId,
    route: event.payload?.route ?? state.route,
    updatedAt: event.created_at ?? state.updatedAt,
  }), { lastEvent: null, lastEventType: null, locationId: null, route: null, updatedAt: null });
}

export function createLiveFeedbackService(live) {
  if (!live) throw new Error('Live Network service is required.');
  return Object.freeze({
    listRouteFeedback: async ({ locationId = null, limit = 100 } = {}) => {
      const events = await live.list({ locationId, types: [...ROUTE_EVENTS], limit });
      return reduceRouteFeedback(events);
    },
    subscribeRouteFeedback: ({ locationId = null, onChange }) => {
      if (typeof onChange !== 'function') return () => {};
      return live.subscribe({ locationId, onEvent: event => {
        if (ROUTE_EVENTS.has(event?.event_type)) onChange(event);
      }});
    },
  });
}
