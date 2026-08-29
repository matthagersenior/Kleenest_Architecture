import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) throw new Error('VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are required.');

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
const origin = { latitude: 38.627, longitude: -90.199 };
const radiusMeters = 80467;

const { data: mapRows, error: mapError } = await supabase.rpc('map_network_nearby_v1', {
  p_lat: origin.latitude,
  p_lng: origin.longitude,
  p_radius_m: radiusMeters,
  p_limit: 50,
  p_category: null,
  p_search: null,
  p_amenity_names: []
});
if (mapError) throw mapError;
const rows = Array.isArray(mapRows) ? mapRows : [];
if (!rows.length) throw new Error('Canonical map discovery returned no locations for the interoperability smoke origin.');
const invalid = rows.filter(row => !row.location_id || !Number.isFinite(Number(row.latitude)) || !Number.isFinite(Number(row.longitude)));
if (invalid.length) throw new Error(`Canonical map discovery returned ${invalid.length} rows without canonical identity/coordinates.`);

const { data: prepared, error: prepareError } = await supabase.rpc('prepare_universal_location_discovery', {
  p_lat: origin.latitude,
  p_lng: origin.longitude,
  p_radius_m: radiusMeters,
  p_user_id: null,
  p_category: null,
  p_search: null,
  p_limit: 50
});
if (prepareError) throw prepareError;
const preparedLocations = Array.isArray(prepared?.locations) ? prepared.locations : [];
if (preparedLocations.length) {
  const invalidPrepared = preparedLocations.filter(row => !(row.location_id ?? row.id) || !Number.isFinite(Number(row.latitude)) || !Number.isFinite(Number(row.longitude)));
  if (invalidPrepared.length) throw new Error(`Universal discovery returned ${invalidPrepared.length} non-canonical location records.`);
}

console.log(JSON.stringify({
  status: 'ok',
  mapRows: rows.length,
  preparedRows: preparedLocations.length,
  canonicalLocationIds: rows.length - invalid.length,
  origin
}, null, 2));
