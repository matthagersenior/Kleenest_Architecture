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
    id: row.id ?? row.location_id,
    location_id: row.location_id ?? row.id,
    category: row.category ?? row.place_type ?? 'service',
    distance_km: row.distance_km ?? (row.distance_meters == null ? undefined : row.distance_meters / 1000),
    distance_miles: row.distance_miles ?? (row.distance_meters == null ? undefined : row.distance_meters / 1609.344),
    amenities: row.amenities ?? [],
    fixtures: row.fixtures ?? {},
    brand: row.brand ?? null,
    operator_name: row.operator_name ?? null,
    osm_tags: row.osm_tags ?? {},
    is_verified: row.is_verified ?? row.verification_status === 'verified'
  });
}

function normalizePrepared(row) {
  return normalize({
    ...row,
    distance_meters: row.distance_meters == null ? undefined : Number(row.distance_meters)
  });
}

function distanceMeters(lat1, lng1, lat2, lng2) {
  const toRad = value => value * Math.PI / 180;
  const a1 = toRad(lat1);
  const a2 = toRad(lat2);
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(a1) * Math.cos(a2) * Math.sin(dLng / 2) ** 2;
  return 6371008.8 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function directSupabaseNearby(client, { latitude, longitude, radiusKm, limit, category, search }) {
  const radiusM = Math.round(Math.min(Math.max(Number(radiusKm) || 8, 1), 100) * 1000);
  const latDelta = radiusM / 111320;
  const lngDelta = radiusM / (111320 * Math.max(Math.cos(latitude * Math.PI / 180), 0.2));
  let query = client
    .from('locations')
    .select('*')
    .eq('is_active', true)
    .gte('latitude', latitude - latDelta)
    .lte('latitude', latitude + latDelta)
    .gte('longitude', longitude - lngDelta)
    .lte('longitude', longitude + lngDelta)
    .limit(2000);
  const { data, error } = await query;
  if (error) throw error;
  const normalizedCategory = category === 'all' ? null : String(category).toLowerCase();
  const q = String(search || '').trim().toLowerCase();
  return (data ?? [])
    .filter(row => Number.isFinite(Number(row.latitude)) && Number.isFinite(Number(row.longitude)))
    .map(row => ({ ...row, distance_meters: distanceMeters(latitude, longitude, Number(row.latitude), Number(row.longitude)) }))
    .filter(row => row.distance_meters <= radiusM)
    .filter(row => !normalizedCategory || String(row.place_type || '').toLowerCase() === normalizedCategory || (normalizedCategory === 'restroom' && (row.has_bathroom === true || row.has_restroom === true || row.bathroom_verification_status === 'has_bathroom')))
    .filter(row => !q || [row.name, row.address, row.city, row.state, row.place_type, row.description, row.owner_name].filter(Boolean).join(' ').toLowerCase().includes(q))
    .sort((a, b) => a.distance_meters - b.distance_meters)
    .slice(0, Math.min(Math.max(Number(limit) || 500, 1), 500))
    .map(normalize);
}

export function createMapNetworkService(client) {
  if (!client) throw new Error('Supabase client is required.');

  async function nearby({ latitude, longitude, radiusKm = 8, limit = 500, category = 'all', search = '', amenities = {} } = {}) {
    if (latitude == null || longitude == null) return [];
    const amenityNames = Object.entries(amenities).filter(([, enabled]) => Boolean(enabled)).map(([name]) => name);
    try {
      const { data, error } = await client.rpc('map_network_nearby_v1', {
        p_lat: latitude,
        p_lng: longitude,
        p_radius_m: Math.round(radiusKm * 1000),
        p_limit: Math.min(Math.max(limit, 1), 500),
        p_category: category === 'all' ? null : category,
        p_search: String(search).trim() || null,
        p_amenity_names: amenityNames.length ? amenityNames : null
      });
      if (!error && Array.isArray(data) && data.length) return data.map(normalize);
    } catch {
      // Fall through to the canonical public locations table.
    }
    return directSupabaseNearby(client, { latitude, longitude, radiusKm, limit, category, search });
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
    const { data, error } = await client.functions.invoke('ingest-map-candidates', { body: { latitude, longitude, radius_km: radius } });
    if (error) throw error;
    return data ?? null;
  }

  async function search(search, { latitude, longitude, radiusKm = 50, limit = 200 } = {}) {
    const query = String(search ?? '').trim();
    if (!query) return [];
    if (latitude != null && longitude != null) return nearby({ latitude, longitude, radiusKm, limit, search: query });
    const { data, error } = await client.rpc('search_locations', { search_text: query, max_results: Math.min(limit, 200) });
    if (error) throw error;
    return (data ?? []).filter(row => Number.isFinite(Number(row.latitude)) && Number.isFinite(Number(row.longitude))).map(normalize);
  }

  return Object.freeze({ nearby, prepareNearby, discoverNearby, search });
}
