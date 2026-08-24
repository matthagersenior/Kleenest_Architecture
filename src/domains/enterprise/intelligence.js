export function createEnterpriseIntelligenceService(supabase){
 const rpc=async(name,params={})=>{const{data,error}=await supabase.rpc(name,params);if(error)throw error;return data};
 return Object.freeze({
  getNetwork:(networkId,start,end)=>rpc('get_enterprise_partner_network',{p_network_id:networkId,p_start:start,p_end:end}),
  benchmark:(networkId,start,end)=>rpc('get_partner_network_benchmark',{p_network_id:networkId,p_start:start,p_end:end}),
  campaignRoi:(campaignId,start,end)=>rpc('get_partner_campaign_roi',{p_campaign_id:campaignId,p_start:start,p_end:end}),
  allocationRoi:(allocationId,start,end)=>rpc('get_partner_allocation_roi',{p_allocation_id:allocationId,p_start:start,p_end:end}),
  recordMetric:(networkId,metricDate,values={})=>rpc('record_enterprise_partner_metric',{p_network_id:networkId,p_metric_date:metricDate,p_visits:Number(values.visits||0),p_check_ins:Number(values.checkIns||0),p_reviews:Number(values.reviews||0),p_preferred_uses:Number(values.preferredUses||0),p_access_redemptions:Number(values.accessRedemptions||0),p_promotion_redemptions:Number(values.promotionRedemptions||0)}),
  recordCampaignOutcome:(campaignId,businessId,values={})=>rpc('record_enterprise_partner_campaign_outcome',{p_campaign_id:campaignId,p_partner_business_id:businessId,p_visits:Number(values.visits||0),p_check_ins:Number(values.checkIns||0),p_reviews:Number(values.reviews||0),p_preferred_uses:Number(values.preferredUses||0),p_access_redemptions:Number(values.accessRedemptions||0),p_promotion_redemptions:Number(values.promotionRedemptions||0),p_attributed_users:Number(values.attributedUsers||0),p_points_awarded:Number(values.pointsAwarded||0)}),
  createCampaign:(networkId,name,type,goal)=>rpc('create_enterprise_partner_campaign',{p_network_id:networkId,p_name:name,p_campaign_type:type,p_goal:goal}),
  activateCampaign:campaignId=>rpc('activate_enterprise_partner_campaign',{p_campaign_id:campaignId}),
  pauseCampaign:campaignId=>rpc('pause_enterprise_partner_campaign',{p_campaign_id:campaignId})
 });
}