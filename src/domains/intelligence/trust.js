export function createLocationTrustService(client) {
  if (!client) throw new Error('Supabase client is required.');
  const rpc = async (name, params) => { const { data, error } = await client.rpc(name, params); if (error) throw error; return data; };
  return Object.freeze({
    get: locationId => rpc('get_location_trust_state', { p_location_id: locationId }),
    refresh: locationId => rpc('refresh_location_trust_state', { p_location_id: locationId }),
    targets: (limit = 25) => rpc('select_reverification_targets', { p_limit: limit }),
    recordVerification: locationId => rpc('record_verification_streak', { p_location_id: locationId })
  });
}

export function trustStateLabel(state = {}) {
  const status = String(state.staleness_status || 'unknown');
  return ({ fresh: 'Fresh', recent: 'Recently verified', aging: 'Aging', stale: 'Needs reverification', very_stale: 'Very stale', unknown: 'Not yet verified' })[status] || 'Unknown';
}

export function trustStateTone(state = {}) {
  const status = String(state.staleness_status || 'unknown');
  if (status === 'fresh') return 'fresh';
  if (status === 'recent') return 'recent';
  if (status === 'aging') return 'aging';
  if (status === 'stale' || status === 'very_stale') return 'stale';
  return 'unknown';
}
