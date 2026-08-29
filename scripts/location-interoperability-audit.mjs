import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) throw new Error('VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are required.');

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
const origin = { latitude: 38.627, longitude: -90.199 };
const radiusMeters = 80467;
const mapArgs = {
  p_lat: origin.latitude, p_lng: origin.longitude, p_radius_m: radiusMeters, p_limit: 50,
  p_category: null, p_search: null, p_amenity_names: []
};

// PostgREST can briefly retain a stale function privilege/schema view immediately
// after a production migration. Retry only transient permission/schema-cache failures;
// never turn a real application error into a passing audit.
let mapRows = null;
let mapError = null;
for (let attempt = 1; attempt <= 3; attempt += 1) {
  const result = await supabase.rpc('map_network_nearby_v1', mapArgs);
  mapRows = result.data;
  mapError = result.error;
  if (!mapError) break;
  if (mapError.code !== '42501' || attempt === 3) break;
  await new Promise(resolve => setTimeout(resolve, attempt * 1500));
}
if (mapError) throw mapError;
const rows = Array.isArray(mapRows) ? mapRows : [];
if (!rows.length) throw new Error('Canonical map discovery returned no locations for the interoperability smoke origin.');
const invalid = rows.filter(row => !row.location_id || !Number.isFinite(Number(row.latitude)) || !Number.isFinite(Number(row.longitude)));
if (invalid.length) throw new Error(`Canonical map discovery returned ${invalid.length} rows without canonical identity/coordinates.`);

// Universal discovery deliberately requires an authenticated user because it
// creates a user_location_sessions record and validates p_user_id against
// auth.uid(). CI only has the public key, so preserve that authorization
// boundary. A CI auth token can be supplied to exercise the full path.
let preparedLocations = [];
let universalDiscovery = 'authenticated-only-not-smoked';
const authToken = process.env.SUPABASE_AUDIT_AUTH_TOKEN;
if (authToken) {
  const authenticated = createClient(url, key, { global: { headers: { Authorization: `Bearer ${authToken}` } }, auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  const { data: prepared, error: prepareError } = await authenticated.rpc('prepare_universal_location_discovery', {
    p_lat: origin.latitude, p_lng: origin.longitude, p_radius_m: radiusMeters, p_user_id: null,
    p_category: null, p_search: null, p_limit: 50
  });
  if (prepareError) throw prepareError;
  preparedLocations = Array.isArray(prepared?.locations) ? prepared.locations : [];
  universalDiscovery = 'authenticated-smoked';
  const invalidPrepared = preparedLocations.filter(row => !(row.location_id ?? row.id) || !Number.isFinite(Number(row.latitude)) || !Number.isFinite(Number(row.longitude)));
  if (invalidPrepared.length) throw new Error(`Universal discovery returned ${invalidPrepared.length} non-canonical location records.`);
}

console.log(JSON.stringify({ status: 'ok', mapRows: rows.length, preparedRows: preparedLocations.length, universalDiscovery, canonicalLocationIds: rows.length - invalid.length, origin }, null, 2));
