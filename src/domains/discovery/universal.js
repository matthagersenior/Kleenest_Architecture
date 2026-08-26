const DISCOVERY_FALLBACK_TTL_MS = 5 * 60 * 1000;
const DISCOVERY_FALLBACK_MAX_ENTRIES = 24;
const DISCOVERY_MAX_CATEGORY_LENGTH = 64;
const DISCOVERY_MAX_SEARCH_LENGTH = 160;
const discoveryFallbackCache = new Map();

const normalizeDiscoveryRequest = ({ latitude, longitude, radiusKm = 50, category = undefined, search = undefined, limit = 1000 } = {}) => {
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

  const parsedRadius = Number(radiusKm);
  const radius = Math.min(Math.max(Number.isFinite(parsedRadius) ? parsedRadius : 50, 1), 80.467);
  const safeCategory = typeof category === 'string' ? category.trim().slice(0, DISCOVERY_MAX_CATEGORY_LENGTH) || undefined : undefined;
  const safeSearch = typeof search === 'string' ? search.trim().slice(0, DISCOVERY_MAX_SEARCH_LENGTH) || undefined : undefined;
  const parsedLimit = Number(limit);
  const safeLimit = Math.min(Math.max(Number.isFinite(parsedLimit) ? parsedLimit : 1000, 25), 2000);

  return Object.freeze({ lat, lng, radius, safeCategory, safeSearch, safeLimit });
};

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
    nearby: async ({ latitude, longitude, radiusKm = 50, category = undefined, search = undefined, limit = 1000, discover = false } = {}) => {
      const request = normalizeDiscoveryRequest({ latitude, longitude, radiusKm, category, search, limit });
      if (!request) return [];
      const { lat, lng, radius, safeCategory, safeSearch, safeLimit } = request;

      let safeUserId;
      try {
        const { data: authData, error: authError } = await client.auth.getUser();
        if (authError) throw authError;
        safeUserId = authData?.user?.id;
      } catch {
        // Never forward caller-supplied identity to the privileged discovery RPC.
        // An unavailable auth session must not become an identity-selection channel.
        return [];
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
      const cacheKey = fallbackKey({ ...request, safeUserId });
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
        const cached = fallback();
        if (cached) return cached;
        throw error;
      }

      if (locations.length) {
        writeFallback(cacheKey, locations);
        return locations;
      }
      if (!discover || typeof client.functions?.invoke !== 'function') return fallback() || locations;

      try {
        const { error: ingestError } = await client.functions.invoke('ingest-map-candidates-v3', {
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
        const cached = fallback();
        if (cached) return cached;
        throw error;
      }

      if (locations.length) {
        writeFallback(cacheKey, locations);
        return locations;
      }
      return fallback() || locations;
    }
  });
}
