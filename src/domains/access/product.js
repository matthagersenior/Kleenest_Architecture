export function createProductAccessService(client) {
  if (!client) throw new Error('Supabase client is required.');
  const rpc = async (name, params = {}) => { const { data, error } = await client.rpc(name, params); if (error) throw error; return data; };
  return Object.freeze({
    consumerEntitlements: async () => { const data = await rpc('get_current_user_product_entitlements'); return Array.isArray(data) ? data : []; },
    businessAccess: async (businessId) => { const data = await rpc('get_business_product_access', { p_business_id: businessId }); return Array.isArray(data) ? data[0] ?? null : data ?? null; },
    preferredLocationEligibility: locationId => rpc('check_preferred_eligibility', { p_location_id: locationId }),
    singleUseAccess: {
      offers: () => rpc('get_single_use_access_offers'),
      purchase: offerId => rpc('purchase_single_use_access', { p_offer_id: offerId }),
      redeem: purchaseId => rpc('redeem_single_use_access', { p_purchase_id: purchaseId })
    }
  });
}
