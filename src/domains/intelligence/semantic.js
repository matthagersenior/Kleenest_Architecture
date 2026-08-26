const MAX_QUERY_LENGTH = 500;

export function createSemanticSearchService(client) {
  if (!client) throw new Error('Supabase client is required.');
  return Object.freeze({
    search: async ({ query, latitude = null, longitude = null, radiusMeters = 16093, limit = 25 } = {}) => {
      const safeQuery = String(query ?? '').trim().slice(0, MAX_QUERY_LENGTH);
      if (!safeQuery) throw new Error('Tell Kleenest what you are looking for.');
      const { data, error } = await client.rpc('semantic_location_search', {
        p_query: safeQuery,
        p_lat: Number.isFinite(Number(latitude)) ? Number(latitude) : null,
        p_lng: Number.isFinite(Number(longitude)) ? Number(longitude) : null,
        p_radius_m: Math.round(Number(radiusMeters) || 16093),
        p_limit: Math.min(Math.max(Number(limit) || 25, 1), 100)
      });
      if (error) throw error;
      return data && typeof data === 'object' ? data : { query: safeQuery, interpreted_filters: {}, results: [] };
    }
  });
}
