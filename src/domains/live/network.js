export const LIVE_EVENT_TYPES = Object.freeze({
  USER_LOCATION_VIEWED: 'user.location_viewed', USER_DIRECTIONS_REQUESTED: 'user.directions_requested', USER_ROUTE_STARTED: 'user.route_started',
  USER_APPROACHING_LOCATION: 'user.approaching_location', USER_ARRIVED: 'user.arrived', USER_DEPARTED: 'user.departed', QR_CHECK_IN: 'user.qr_check_in',
  LOCATION_FAVORITED: 'user.location_favorited', LOCATION_UNFAVORITED: 'user.location_unfavorited', LOCATION_VERIFIED: 'location.verified', LOCATION_STALE: 'location.stale', LOCATION_CONFLICT: 'location.conflict', BUSINESS_OFFER_STARTED: 'business.offer_started',
  VEHICLE_ENTERED_ZONE: 'fleet.vehicle_entered_zone', VEHICLE_ARRIVED: 'fleet.vehicle_arrived', VEHICLE_DEPARTED: 'fleet.vehicle_departed', FLEET_ROUTE_STARTED: 'fleet.route_started', ROUTE_CHANGED: 'fleet.route_changed', TASK_COMPLETED: 'fleet.task_completed'
});

export function createLiveNetworkService(client) {
  if (!client) throw new Error('Supabase client is required.');
  return Object.freeze({
    publish: async ({ type, locationId = null, payload = {}, actorType = 'user', actorId = null }) => {
      const { data: { user }, error: authError } = await client.auth.getUser(); if (authError) throw authError; if (!user) throw new Error('Sign in to continue.');
      const { data, error } = await client.from('live_network_events').insert({ event_type: type, location_id: locationId, actor_type: actorType, actor_id: actorId || user.id, payload }).select().single(); if (error) throw error; return data;
    },
    list: async ({ locationId = null, types = null, limit = 100 } = {}) => {
      const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 1000);
      let query = client.from('live_network_events').select('id,event_type,location_id,actor_type,actor_id,payload,created_at').order('created_at', { ascending: false }).limit(safeLimit);
      if (locationId) query = query.eq('location_id', locationId); if (types?.length) query = query.in('event_type', types);
      const { data, error } = await query; if (error) throw error; return data ?? [];
    },
    subscribe: ({ locationId = null, onEvent }) => {
      if (typeof onEvent !== 'function') throw new Error('onEvent callback is required.');
      const channel = client.channel(`live-network-${locationId || 'global'}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'live_network_events', ...(locationId ? { filter: `location_id=eq.${locationId}` } : {}) }, onEvent).subscribe();
      return () => client.removeChannel(channel);
    }
  });
}
