export function createLocationVerificationService(client) {
  if (!client) throw new Error('Supabase client is required.');
  return Object.freeze({
    submit: async ({ locationId, isOpen, isPublic, latitude = null, longitude = null }) => { const { data, error } = await client.rpc('record_location_verification', { p_location_id: locationId, p_has_public_bathroom: Boolean(isOpen && isPublic), p_latitude: latitude, p_longitude: longitude, p_method: 'community' }); if (error) throw error; return data; },
    summary: async (locationId) => { const { data, error } = await client.from('location_bathroom_verifications').select('id,user_id,has_public_bathroom,verification_method,latitude,longitude,distance_meters,created_at').eq('location_id', locationId).order('created_at', { ascending: false }).limit(50); if (error) throw error; const rows = data ?? []; return { observations: rows, total: rows.length, openCount: rows.filter(r => r.has_public_bathroom).length, lastObservedAt: rows[0]?.created_at ?? null }; }
  });
}
