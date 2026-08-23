import { createLiveNetworkService, LIVE_EVENT_TYPES } from '../live/network.js';

export function createFavoriteService(client) {
  if (!client) throw new Error('Supabase client is required.');
  const live = createLiveNetworkService(client);
  async function requireUser() { const { data: { user }, error } = await client.auth.getUser(); if (error) throw error; if (!user) throw new Error('Sign in to continue.'); return user; }
  return Object.freeze({
    list: async () => {
      await requireUser();
      const { data, error } = await client.rpc('my_favorite_locations');
      if (error) throw error;
      return Array.isArray(data) ? data : [];
    },
    toggle: async locationId => {
      await requireUser();
      if (!locationId) throw new Error('Location is required.');
      const { data, error } = await client.rpc('kleenest_toggle_favorite', { p_location_id: locationId });
      if (error) throw error;
      const favorited = typeof data === 'boolean' ? data : Boolean(data?.favorited ?? data?.is_favorite ?? data?.is_favorited);
      try { await live.publish({ type: favorited ? LIVE_EVENT_TYPES.LOCATION_FAVORITED : LIVE_EVENT_TYPES.LOCATION_UNFAVORITED, locationId, payload: { result: data } }); } catch { /* mutation remains authoritative */ }
      return data;
    },
    metrics: async locationId => {
      await requireUser();
      if (!locationId) throw new Error('Location is required.');
      const { data, error } = await client.rpc('location_favorite_route_metrics', { p_location_id: locationId });
      if (error) throw error;
      return data;
    }
  });
}
