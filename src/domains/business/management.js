export function createBusinessManagementService(client) {
  if (!client) throw new Error('Supabase client is required.');
  async function user() { const { data: { user }, error } = await client.auth.getUser(); if (error) throw error; if (!user) throw new Error('Sign in to continue.'); return user; }
  async function rpc(name, args = {}) { await user(); const { data, error } = await client.rpc(name, args); if (error) throw error; return data; }
  const read = (name, args = {}) => rpc(name, args);
  return Object.freeze({
    listBusinesses: () => read('get_business_dashboard', {}),
    listLocations: (businessId) => read('business_list_locations', { p_business_id: businessId }),
    createLocation: (businessId, payload) => rpc('business_manage_location', { p_business_id: businessId, p_location_id: null, p_action: 'create', p_payload: payload }),
    updateLocation: (businessId, locationId, payload) => rpc('business_manage_location', { p_business_id: businessId, p_location_id: locationId, p_action: 'update', p_payload: payload }),
    listQrs: (businessId) => read('business_qr_detail', { p_business_id: businessId }),
    createQr: (businessId, locationId, payload) => rpc('business_manage_qr', { p_business_id: businessId, p_location_id: locationId, p_qr_id: null, p_action: 'create', p_payload: payload }),
    listCampaigns: (businessId) => read('business_list_campaigns', { p_business_id: businessId }),
    createCampaign: (businessId, payload) => rpc('business_manage_campaign', { p_business_id: businessId, p_campaign_id: null, p_action: 'create', p_name: payload.name, p_campaign_type: payload.type ?? 'general', p_goal: payload.goal ?? '', p_status: payload.status ?? 'draft' }),
    listEvents: (businessId) => read('business_list_events', { p_business_id: businessId }),
    listPromotions: (businessId) => read('business_promotion_detail', { p_business_id: businessId }),
    listContests: (businessId) => read('business_list_contests', { p_business_id: businessId }),
    analytics: (businessId) => read('business_summary_analytics', { p_business_id: businessId }),
    locationIntelligence: (businessId) => read('business_location_intelligence', { p_business_id: businessId }),
    growthAnalytics: (businessId) => read('business_growth_analytics', { p_business_id: businessId }),
    roiAnalytics: (businessId) => read('business_roi_analytics', { p_business_id: businessId }),
    visitorAnalytics: (businessId) => read('business_visitor_analytics', { p_business_id: businessId }),
    engagementFunnel: (businessId) => read('business_engagement_funnel', { p_business_id: businessId }),
    occupancyAnalytics: (businessId) => read('business_occupancy_analytics', { p_business_id: businessId }),
    benchmarkAnalytics: (businessId) => read('business_benchmark_analytics', { p_business_id: businessId }),
    campaignAnalytics: (businessId) => read('business_campaign_analytics', { p_business_id: businessId }),
    promotionAnalytics: (businessId) => read('business_promotion_analytics', { p_business_id: businessId }),
    qrAnalytics: (businessId) => read('business_qr_analytics', { p_business_id: businessId }),
    eventAnalytics: (businessId) => read('business_event_analytics', { p_business_id: businessId }),
    mediaAnalytics: (businessId) => read('business_media_analytics', { p_business_id: businessId }),
    partnerAnalytics: (businessId) => read('business_partner_analytics', { p_business_id: businessId }),
    rewardsAnalytics: (businessId) => read('business_rewards_analytics', { p_business_id: businessId }),
    intelligenceActions: (businessId) => read('business_intelligence_actions', { p_business_id: businessId }),
    reviewAnalytics: (businessId) => read('business_review_analytics', { p_business_id: businessId }),
    replyToReview: (businessId, reviewId, reply) => rpc('business_reply_review', { p_business_id: businessId, p_review_id: reviewId, p_reply: String(reply ?? '').trim() })
  });
}
