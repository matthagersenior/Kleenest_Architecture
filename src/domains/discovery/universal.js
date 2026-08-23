export function createUniversalDiscoveryService(client) {
  if (!client) throw new Error('Supabase client is required.');
  return Object.freeze({
    nearby: async ({ latitude, longitude, radiusKm = 50, userId = undefined } = {}) => {
      const lat = Number(latitude);
      const lng = Number(longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return [];
      const radius = Math.min(Math.max(Number(radiusKm) || 1, 1), 50);
      const safeUserId = typeof userId === 'string' && userId.trim() ? userId.trim() : undefined;
      const { data, error } = await client.rpc('prepare_universal_location_discovery', { p_lat: lat, p_lng: lng, p_radius_m: Math.round(radius * 1000), p_user_id: safeUserId });
      if (error) throw error;
      const locations = Array.isArray(data?.locations) ? data.locations : [];
      return locations.filter(location => location?.id || location?.location_id || location?.place_id);
    }
  });
}
