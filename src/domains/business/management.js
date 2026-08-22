export function createBusinessManagementService(client) {
  if (!client) throw new Error('Supabase client is required.');
  async function user() { const { data: { user }, error } = await client.auth.getUser(); if (error) throw error; if (!user) throw new Error('Sign in to continue.'); return user; }
  async function rpc(name, args = {}) { await user(); const { data, error } = await client.rpc(name, args); if (error) throw error; return data; }
  return Object.freeze({
    listBusinesses: () => rpc('get_business_dashboard', {}),
    listLocations: (businessId) => rpc('business_list_locations', { p_business_id: businessId }),
    createLocation: (businessId, payload) => rpc('business_manage_location', { p_business_id: businessId, p_location_id: null, p_action: 'create', p_payload: payload }),
    updateLocation: (businessId, locationId, payload) => rpc('business_manage_location', { p_business_id: businessId, p_location_id: locationId, p_action: 'update', p_payload: payload }),
    listQrs: (businessId) => rpc('business_qr_detail', { p_business_id: businessId }),
    createQr: (businessId, locationId, payload) => rpc('business_manage_qr', { p_business_id: businessId, p_location_id: locationId, p_qr_id: null, p_action: 'create', p_payload: payload }),
    listCampaigns: (businessId) => rpc('business_list_campaigns', { p_business_id: businessId }),
    createCampaign: (businessId, payload) => rpc('business_manage_campaign', { p_business_id: businessId, p_campaign_id: null, p_action: 'create', p_name: payload.name, p_campaign_type: payload.type ?? 'general', p_goal: payload.goal ?? '', p_status: payload.status ?? 'draft' }),
    listEvents: (businessId) => rpc('business_list_events', { p_business_id: businessId }),
    listPromotions: (businessId) => rpc('business_promotion_detail', { p_business_id: businessId }),
    listContests: (businessId) => rpc('business_list_contests', { p_business_id: businessId }),
    analytics: (businessId) => rpc('business_summary_analytics', { p_business_id: businessId }),
    locationIntelligence: (businessId) => rpc('business_location_intelligence', { p_business_id: businessId }),
    reviewAnalytics: (businessId) => rpc('business_review_analytics', { p_business_id: businessId }),
    replyToReview: (businessId, reviewId, reply) => rpc('business_reply_review', { p_business_id: businessId, p_review_id: reviewId, p_reply: String(reply ?? '').trim() })
  });
}
