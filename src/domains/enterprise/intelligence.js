import{createCapabilityCoverageService}from'../entitlements/coverage.js';
export function createEnterpriseIntelligenceService(supabase,{coverage=createCapabilityCoverageService(supabase)}={}){
 const rpc=async(name,params={})=>{const{data,error}=await supabase.rpc(name,params);if(error)throw error;return data};
 const outcome=async(featureCode,result,metadata={})=>{try{await coverage.record({featureCode,outcome:result,tierCode:'enterprise',destination:'enterprise_intelligence',metadata})}catch{}};
 const mutate=async(featureCode,fn,metadata={})=>{try{const result=await fn();await outcome(featureCode,'allowed',metadata);return result}catch(error){await outcome(featureCode,'blocked',{...metadata,error:error?.message});throw error}};
 return Object.freeze({
  getNetwork:(networkId,start,end)=>rpc('get_enterprise_partner_network',{p_network_id:networkId,p_start:start,p_end:end}),
  benchmark:(networkId,start,end)=>rpc('get_partner_network_benchmark',{p_network_id:networkId,p_start:start,p_end:end}),
  campaignRoi:(campaignId,start,end)=>rpc('get_partner_campaign_roi',{p_campaign_id:campaignId,p_start:start,p_end:end}),
  allocationRoi:(networkId,start,end)=>rpc('get_partner_allocation_roi',{p_network_id:networkId,p_start:start,p_end:end}),
  recordMetric:(networkId,metricDate,values={})=>mutate('enterprise.network_metric',()=>rpc('record_enterprise_partner_metric',{p_network_id:networkId,p_metric_date:metricDate,p_visits:Number(values.visits||0),p_check_ins:Number(values.checkIns||0),p_reviews:Number(values.reviews||0),p_preferred_uses:Number(values.preferredUses||0),p_access_redemptions:Number(values.accessRedemptions||0),p_promotion_redemptions:Number(values.promotionRedemptions||0)}),{networkId,metricDate}),
  recordCampaignOutcome:(campaignId,businessId,values={})=>mutate('enterprise.campaign_outcome',()=>rpc('record_enterprise_partner_campaign_outcome',{p_campaign_id:campaignId,p_partner_business_id:businessId,p_visits:Number(values.visits||0),p_check_ins:Number(values.checkIns||0),p_reviews:Number(values.reviews||0),p_preferred_uses:Number(values.preferredUses||0),p_access_redemptions:Number(values.accessRedemptions||0),p_promotion_redemptions:Number(values.promotionRedemptions||0),p_attributed_users:Number(values.attributedUsers||0),p_points_awarded:Number(values.pointsAwarded||0)}),{campaignId,businessId}),
  createCampaign:(networkId,name,type,goal)=>mutate('enterprise.campaign_create',()=>rpc('create_enterprise_partner_campaign',{p_network_id:networkId,p_name:name,p_campaign_type:type,p_goal:goal}),{networkId}),
  activateCampaign:campaignId=>mutate('enterprise.campaign_activate',()=>rpc('activate_enterprise_partner_campaign',{p_campaign_id:campaignId}),{campaignId}),
  pauseCampaign:campaignId=>mutate('enterprise.campaign_pause',()=>rpc('pause_enterprise_partner_campaign',{p_campaign_id:campaignId}),{campaignId})
 });
}
