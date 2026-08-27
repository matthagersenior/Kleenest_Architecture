export function createProductAccessService(client, { analytics = null } = {}) {
  if (!client) throw new Error('Supabase client is required.');
  const rpc = async (name, params = {}) => { const { data, error } = await client.rpc(name, params); if (error) throw error; return data; };
  const track = (event, metadata = {}) => analytics?.record?.(event, { featureCode: event, metadata }).catch?.(() => null);
  return Object.freeze({
    consumerEntitlements: async () => { const data = await rpc('get_current_user_product_entitlements'); return Array.isArray(data) ? data : []; },
    businessAccess: async (businessId) => { const data = await rpc('get_business_product_access', { p_business_id: businessId }); return Array.isArray(data) ? data[0] ?? null : data ?? null; },
    preferredLocationEligibility: locationId => rpc('check_preferred_eligibility', { p_location_id: locationId }),
    preferredLocation: {
      eligibility: locationId => rpc('can_activate_preferred_location', { p_location_id: locationId }),
      activate: async locationId => { const data = await rpc('activate_preferred_location', { p_location_id: locationId }); await track('preferred_location_activated', { locationId }); return data; },
      deactivate: async locationId => { const data = await rpc('deactivate_preferred_location', { p_location_id: locationId }); await track('preferred_location_deactivated', { locationId }); return data; },
      recordUse: async (locationId, activationId = null, source = 'consumer') => { const data = activationId ? await rpc('record_preferred_usage', { p_location_id: locationId, p_activation_id: activationId, p_source: source }) : await rpc('record_preferred_location_use', { p_location_id: locationId }); await track('preferred_location_used', { locationId, activationId, source }); return data; }
    },
    singleUseAccess: {
      offers: () => rpc('get_single_use_access_offers'),
      purchase: async offerId => { const data = await rpc('purchase_single_use_access', { p_offer_id: offerId }); await track('access_purchase', { offerId }); return data; },
      redeem: async purchaseId => { const data = await rpc('redeem_single_use_access', { p_purchase_id: purchaseId }); await track('access_redeemed', { purchaseId }); return data; }
    }
  });
}
