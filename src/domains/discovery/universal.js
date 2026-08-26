const DISCOVERY_FALLBACK_TTL_MS = 5 * 60 * 1000;
const DISCOVERY_FALLBACK_MAX_ENTRIES = 24;
const discoveryFallbackCache = new Map();

const fallbackKey = ({ lat, lng, radius, safeCategory, safeSearch, safeUserId }) => [
  safeUserId || 'anonymous',
  lat.toFixed(3),
  lng.toFixed(3),
  Math.round(radius * 1000),
  safeCategory || '',
  safeSearch || ''
].join('|');

const readFallback = key => {
  const entry = discoveryFallbackCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.savedAt > DISCOVERY_FALLBACK_TTL_MS) {
    discoveryFallbackCache.delete(key);
    return null;
  }
  return entry.locations;
};

const writeFallback = (key, locations) => {
  if (!Array.isArray(locations) || !locations.length) return;
  discoveryFallbackCache.delete(key);
  discoveryFallbackCache.set(key, { locations, savedAt: Date.now() });
  while (discoveryFallbackCache.size > DISCOVERY_FALLBACK_MAX_ENTRIES) {
    const oldestKey = discoveryFallbackCache.keys().next().value;
    if (oldestKey === undefined) break;
    discoveryFallbackCache.delete(oldestKey);
  }
};

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
      const cacheKey = fallbackKey({ lat, lng, radius, safeCategory, safeSearch, safeUserId });
      const fallback = () => readFallback(cacheKey);

      const execute = async () => {
        const { data, error } = await client.rpc('prepare_universal_location_discovery', params);
        if (error) throw error;
        const locations = Array.isArray(data?.locations) ? data.locations : [];
        return locations.filter(location => location?.id || location?.location_id || location?.place_id);
      };

      let locations;
      try {
        locations = await execute();
      } catch (error) {
        // A transient RPC failure must never turn an already-populated map into
        // an authoritative-looking empty state. Return the last known-good result
        // for the same user/area/filter tuple when one exists; otherwise preserve
        // the original error so the initial empty state remains distinguishable.
        const cached = fallback();
        if (cached) return cached;
        throw error;
      }

      if (locations.length) {
        writeFallback(cacheKey, locations);
        return locations;
      }
      if (!discover || typeof client.functions?.invoke !== 'function') return locations;

      // Empty canonical results are not treated as proof that the market is empty.
      // Perform one bounded live discovery/ingestion pass, then ask the same canonical
      // RPC again. This keeps the map on one authoritative result surface while allowing
      // a new area to self-populate when no records have been ingested yet.
      try {
        const { error: ingestError } = await client.functions.invoke('ingest-map-candidates-v2', {
          body: { latitude: lat, longitude: lng, radiusKm: radius }
        });
        if (ingestError) throw ingestError;
        try {
          locations = await execute();
        } catch (error) {
          const cached = fallback();
          if (cached) return cached;
          throw error;
        }
      } catch (error) {
        // Discovery is an enhancement, never a reason to make the canonical map crash.
        // If there is no bounded-discovery fallback, propagate the failure so the map
        // surface retains its last successful locations instead of replacing them with [] .
        const cached = fallback();
        if (cached) return cached;
        throw error;
      }
      if (locations.length) writeFallback(cacheKey, locations);
      return locations;
    }
  });
}