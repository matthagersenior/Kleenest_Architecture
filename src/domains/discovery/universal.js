export function createUniversalDiscoveryService(client) {
  if (!client) throw new Error('Supabase client is required.');
  return Object.freeze({
    nearby: async ({ latitude, longitude, radiusKm = 50, userId = undefined } = {}) => {
      if (latitude == null || longitude == null) return [];
      const { data, error } = await client.rpc('prepare_universal_location_discovery', { p_lat: Number(latitude), p_lng: Number(longitude), p_radius_m: Math.round(Math.min(Math.max(radiusKm, 1), 50) * 1000), p_user_id: userId });
      if (error) throw error;
      return Array.isArray(data?.locations) ? data.locations : [];
    }
  });
}
