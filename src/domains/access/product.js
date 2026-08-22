export function createProductAccessService(client) {
  if (!client) throw new Error('Supabase client is required.');
  return Object.freeze({
    consumerEntitlements: async () => { const { data, error } = await client.rpc('get_current_user_product_entitlements'); if (error) throw error; return Array.isArray(data) ? data : []; },
    businessAccess: async (businessId) => { const { data, error } = await client.rpc('get_business_product_access', { p_business_id: businessId }); if (error) throw error; return Array.isArray(data) ? data[0] ?? null : data ?? null; },
    preferredLocationEligibility: async (locationId) => { const { data, error } = await client.rpc('check_preferred_eligibility', { p_location_id: locationId }); if (error) throw error; return data; }
  });
}
