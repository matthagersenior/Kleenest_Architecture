export function createFavoriteService(client) {
  if (!client) throw new Error('Supabase client is required.');
  return Object.freeze({
    list: async () => {
      const { data, error } = await client.rpc('my_favorite_locations');
      if (error) throw error;
      return Array.isArray(data) ? data : [];
    },
    toggle: async locationId => {
      if (!locationId) throw new Error('Location is required.');
      const { data, error } = await client.rpc('kleenest_toggle_favorite', { p_location_id: locationId });
      if (error) throw error;
      return data;
    },
    metrics: async locationId => {
      if (!locationId) throw new Error('Location is required.');
      const { data, error } = await client.rpc('location_favorite_route_metrics', { p_location_id: locationId });
      if (error) throw error;
      return data;
    }
  });
}
