import { normalizePlace } from '../locations/place.js';

export const MAP_CATEGORIES = Object.freeze([
  { id: 'all', label: 'All' },
  { id: 'restroom', label: 'Bathrooms' },
  { id: 'restaurant', label: 'Restaurants' },
  { id: 'cafe', label: 'Cafes' },
  { id: 'gas_station', label: 'Gas' },
  { id: 'shopping', label: 'Shopping' },
  { id: 'park', label: 'Parks' },
  { id: 'service', label: 'Services' },
  { id: 'health', label: 'Health' },
  { id: 'public_safety', label: 'Public safety' },
  { id: 'cooling_center', label: 'Cooling centers' }
]);

function normalize(row) {
  return normalizePlace({
    ...row,
    distance_km: row.distance_km ?? (row.distance_meters == null ? undefined : row.distance_meters / 1000),
    distance_miles: row.distance_miles ?? (row.distance_meters == null ? undefined : row.distance_meters / 1609.344),
    amenities: row.amenities ?? [],
    fixtures: row.fixtures ?? {},
    brand: row.brand ?? null,
    operator_name: row.operator_name ?? null,
    osm_tags: row.osm_tags ?? {}
  });
}

function normalizePrepared(row) {
  return normalize({
    ...row,
    distance_meters: row.distance_meters == null ? undefined : Number(row.distance_meters),
    category: row.category ?? row.place_type ?? 'service',
    is_verified: row.is_verified ?? row.verification_status === 'verified'
  });
}

export function createMapNetworkService(client) {
  if (!client) throw new Error('Supabase client is required.');

  async function nearby({ latitude, longitude, radiusKm = 8, limit = 500, category = 'all', search = '', amenities = {} } = {}) {
    if (latitude == null || longitude == null) return [];
    const amenityNames = Object.entries(amenities)
      .filter(([, enabled]) => Boolean(enabled))
      .map(([name]) => name);
    const { data, error } = await client.rpc('map_network_nearby_v1', {
      p_lat: latitude,
      p_lng: longitude,
      p_radius_m: Math.round(radiusKm * 1000),
      p_limit: Math.min(Math.max(limit, 1), 500),
      p_category: category === 'all' ? null : category,
      p_search: String(search).trim() || null,
      p_amenity_names: amenityNames.length ? amenityNames : null
    });
    if (error) throw error;
    return (data ?? []).map(normalize);
  }

  async function prepareNearby({ latitude, longitude, radiusKm = 8 } = {}) {
    if (latitude == null || longitude == null) return null;
    const { data: authData } = await client.auth.getUser();
    if (!authData?.user) return null;
    const { data, error } = await client.rpc('prepare_universal_location_discovery', {
      p_lat: latitude,
      p_lng: longitude,
      p_radius_m: Math.round(Math.min(Math.max(Number(radiusKm) || 8, 1), 50) * 1000)
    });
    if (error) throw error;
    const locations = Array.isArray(data?.locations) ? data.locations.map(normalizePrepared) : [];
    return { ...data, locations };
  }

  async function discoverNearby({ latitude, longitude, radiusKm = 8 } = {}) {
    if (latitude == null || longitude == null) return null;
    const radius = Math.min(Math.max(Number(radiusKm) || 8, 1), 50);
    const { data, error } = await client.functions.invoke('ingest-map-candidates', {
      body: { latitude, longitude, radius_km: radius }
    });
    if (error) throw error;
    return data ?? null;
  }

  async function search(search, { latitude, longitude, radiusKm = 50, limit = 200 } = {}) {
    const query = String(search ?? '').trim();
    if (!query) return [];
    if (latitude != null && longitude != null) return nearby({ latitude, longitude, radiusKm, limit, search: query });
    const { data, error } = await client.rpc('search_locations', {
      search_text: query,
      max_results: Math.min(limit, 200)
    });
    if (error) throw error;
    return (data ?? [])
      .filter(row => Number.isFinite(Number(row.latitude)) && Number.isFinite(Number(row.longitude)))
      .map(normalize);
  }

  return Object.freeze({ nearby, prepareNearby, discoverNearby, search });
}
