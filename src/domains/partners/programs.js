export function createPartnerProgramService(client) {
  if (!client) throw new Error('Supabase client is required.');
  async function rpc(name, args = {}) { const { data, error } = await client.rpc(name, args); if (error) throw error; return data; }
  return Object.freeze({
    list: () => rpc('business_list_partner_programs').then(data => data ?? []),
    memberships: () => rpc('list_my_partner_memberships').then(data => data ?? []),
    join: programId => rpc('join_partner_program', { p_program_id: programId }),
    requestAgreement: (programId, partnerBusinessId) => rpc('business_request_partner_agreement', { p_partner_program_id: programId, p_partner_business_id: partnerBusinessId }),
    acceptAgreement: agreementId => rpc('accept_partner_agreement', { p_agreement_id: agreementId }),
    network: (networkId, start, end) => rpc('get_enterprise_partner_network', { p_network_id: networkId, ...(start ? { p_start: start } : {}), ...(end ? { p_end: end } : {}) }),
    benchmarkAnalytics: (networkId, start, end) => rpc('get_partner_network_benchmark', { p_network_id: networkId, ...(start ? { p_start: start } : {}), ...(end ? { p_end: end } : {}) }),
    campaignRoi: (campaignId, start, end) => rpc('get_partner_campaign_roi', { p_campaign_id: campaignId, ...(start ? { p_start: start } : {}), ...(end ? { p_end: end } : {}) }),
    allocationRoi: (networkId, start, end) => rpc('get_partner_allocation_roi', { p_network_id: networkId, ...(start ? { p_start: start } : {}), ...(end ? { p_end: end } : {}) }),
    preferredAnalytics: (businessId, start, end) => rpc('partner_preferred_analytics', { p_business_id: businessId, ...(start ? { p_start: start } : {}), ...(end ? { p_end: end } : {}) }),
    createCampaign: (networkId, name, campaignType = 'engagement', goal = null) => rpc('create_enterprise_partner_campaign', { p_network_id: networkId, p_name: name, p_campaign_type: campaignType, p_goal: goal }),
    activateCampaign: campaignId => rpc('activate_enterprise_partner_campaign', { p_campaign_id: campaignId }),
    pauseCampaign: campaignId => rpc('pause_enterprise_partner_campaign', { p_campaign_id: campaignId }),
    recordCampaignOutcome: (campaignId, partnerBusinessId, metrics = {}) => rpc('record_enterprise_partner_campaign_outcome', { p_campaign_id: campaignId, p_partner_business_id: partnerBusinessId, p_visits: metrics.visits ?? 0, p_check_ins: metrics.checkIns ?? 0, p_reviews: metrics.reviews ?? 0, p_preferred_uses: metrics.preferredUses ?? 0, p_access_redemptions: metrics.accessRedemptions ?? 0, p_promotion_redemptions: metrics.promotionRedemptions ?? 0, p_attributed_users: metrics.attributedUsers ?? 0, p_points_awarded: metrics.pointsAwarded ?? 0 }),
    recordNetworkMetric: (networkId, metricDate, metrics = {}) => rpc('record_enterprise_partner_metric', { p_network_id: networkId, p_metric_date: metricDate, p_visits: metrics.visits ?? 0, p_check_ins: metrics.checkIns ?? 0, p_reviews: metrics.reviews ?? 0, p_preferred_uses: metrics.preferredUses ?? 0, p_access_redemptions: metrics.accessRedemptions ?? 0, p_promotion_redemptions: metrics.promotionRedemptions ?? 0 }),
    fleetAccess: userId => rpc('enable_enterprise_fleet_service', { p_user_id: userId })
  });
}
