export function createOwnerIntelligenceService(client){
  if(!client) throw new Error('Supabase client is required.');
  const rpc=(name,args={})=>client.rpc(name,args).then(({data,error})=>{if(error)throw error;return data;});
  const rows=v=>Array.isArray(v)?v:(v&&Array.isArray(v.rows)?v.rows:[]);
  const businessId=id=>({p_business_id:id});
  return Object.freeze({
    businessGrowthAnalytics:id=>rpc('business_growth_analytics',businessId(id)),
    businessSummaryAnalytics:id=>rpc('business_summary_analytics',businessId(id)),
    businessEngagementAnalytics:id=>rpc('business_engagement_analytics',businessId(id)),
    businessEngagementFunnel:id=>rpc('business_engagement_funnel',businessId(id)),
    businessLocationAnalytics:(id,locationId)=>rpc('business_location_analytics',{p_business_id:id,p_location_id:locationId}),
    businessReviewAnalytics:id=>rpc('business_review_analytics',businessId(id)),
    businessPromotionAnalytics:id=>rpc('business_promotion_analytics',businessId(id)),
    businessCampaignAnalytics:id=>rpc('business_campaign_analytics',businessId(id)),
    businessQrAnalytics:id=>rpc('business_qr_analytics',businessId(id)),
    businessRewardsAnalytics:id=>rpc('business_rewards_analytics',businessId(id)),
    businessRoiAnalytics:id=>rpc('business_roi_analytics',businessId(id)),
    businessBenchmarkAnalytics:id=>rpc('business_benchmark_analytics',businessId(id)),
    businessGrowthActions:id=>rows(rpc('get_business_growth_action_summary',businessId(id))),
    businessMetricDetail:(id,metric)=>rpc('get_business_metric_detail',{p_business_id:id,p_metric_key:metric}),
    fleetMetricCapabilities:id=>rows(rpc('get_fleet_metric_capabilities',{p_fleet_id:id})),
    fleetMetricValues:(id,metric)=>rows(rpc('get_fleet_metric_values',{p_fleet_id:id,p_metric_key:metric})),
    fleetDashboardSummary:id=>rpc('get_fleet_dashboard_summary',{p_fleet_id:id}),
    fleetServiceOpportunities:id=>rows(rpc('get_fleet_service_opportunities',{p_fleet_id:id})),
    enterpriseNetworkMetrics:id=>rows(rpc('get_enterprise_network_metrics',{p_enterprise_id:id})),
    enterpriseCampaignRoi:id=>rows(rpc('get_enterprise_campaign_roi',{p_enterprise_id:id})),
    enterprisePartnerRoi:id=>rows(rpc('get_enterprise_partner_allocation_roi',{p_enterprise_id:id})),
  });
}
