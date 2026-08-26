export function createUniversalDiscoveryService(client) {
  if (!client) throw new Error('Supabase client is required.');
  return Object.freeze({
    nearby: async ({ latitude, longitude, radiusKm = 50, userId = undefined, category = undefined, search = undefined, limit = 1000, discover = false } = {}) => {
      const lat = Number(latitude);
      const lng = Number(longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return [];
      const radius = Math.min(Math.max(Number(radiusKm) || 1, 1), 80.467);
      const safeCategory = typeof category === 'string' && category.trim() ? category.trim() : undefined;
      const safeSearch = typeof search === 'string' && search.trim() ? search.trim() : undefined;
      const safeLimit = Math.min(Math.max(Number(limit) || 1000, 25), 2000);

      // Resolve identity from the live Supabase session immediately before the RPC.
      // Do not fall back to a caller-supplied user id: a stale AppContext/session value
      // must never become the identity used by universal discovery.
      let safeUserId;
      try {
        const { data: authData } = await client.auth.getUser();
        safeUserId = authData?.user?.id || undefined;
      } catch {
        safeUserId = undefined;
      }

      const params = {
        p_lat: lat,
        p_lng: lng,
        p_radius_m: Math.round(radius * 1000),
        p_user_id: safeUserId,
        p_category: safeCategory,
        p_search: safeSearch,
        p_limit: safeLimit
      };

      const execute = async () => {
        const { data, error } = await client.rpc('prepare_universal_location_discovery', params);
        if (error) throw error;
        const locations = Array.isArray(data?.locations) ? data.locations : [];
        return locations.filter(location => location?.id || location?.location_id || location?.place_id);
      };

      let locations = await execute();
      if (locations.length || !discover || typeof client.functions?.invoke !== 'function') return locations;

      // Empty canonical results are not treated as proof that the market is empty.
      // Perform one bounded live discovery/ingestion pass, then ask the same canonical
      // RPC again. This keeps the map on one authoritative result surface while allowing
      // a new area to self-populate when no records have been ingested yet.
      try {
        const { error: ingestError } = await client.functions.invoke('ingest-map-candidates-v2', {
          body: { latitude: lat, longitude: lng, radiusKm: radius }
        });
        if (ingestError) return locations;
        locations = await execute();
      } catch {
        // Discovery is an enhancement, never a reason to make the canonical map crash.
        return locations;
      }
      return locations;
    }
  });
}
