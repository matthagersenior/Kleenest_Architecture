export function createEnterprisePartnerNetworkService(client) {
  if (!client) throw new Error('Supabase client is required.');
  const rpc=async(name,args={})=>{const{data,error}=await client.rpc(name,args);if(error)throw error;return data;};
  const safeArray=data=>Array.isArray(data)?data:[];
  const emit=(type,result,metadata={})=>{if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('kleenest:enterprise-commerce',{detail:{type,result,metadata}}));return result;};
  return Object.freeze({
    get: async (networkId, start, end) => rpc('get_enterprise_partner_network',{p_network_id:networkId,p_start:start,p_end:end}),
    benchmark: async (networkId, start, end) => rpc('get_partner_network_benchmark',{p_network_id:networkId,p_start:start,p_end:end}),
    allocationRoi: async (networkId, start, end) => rpc('get_partner_allocation_roi',{p_network_id:networkId,p_start:start,p_end:end}),
    campaignRoi: async (campaignId, start, end) => rpc('get_partner_campaign_roi',{p_campaign_id:campaignId,p_start:start,p_end:end}),
    controlPlaneSnapshot: async (businessId, windowDays=30) => rpc('enterprise_control_plane_snapshot',{p_business_id:businessId,p_window_days:windowDays}),
    createNetwork: async name => rpc('create_enterprise_partner_network',{p_name:name}),
    listOwnedNetworks: async businessId => rpc('enterprise_list_owned_networks',{p_business_id:businessId}).then(data=>data??[]),
    updateNetwork: async (networkId,name,enabled=true) => rpc('enterprise_update_network',{p_network_id:networkId,p_name:name,p_enabled:enabled}),
    deleteNetwork: async networkId => rpc('enterprise_delete_network',{p_network_id:networkId}),
    listCampaigns: async networkId => rpc('enterprise_list_network_campaigns',{p_network_id:networkId}).then(data=>data??[]),
    createCampaign: async (networkId,name,campaignType='engagement',goal=null) => rpc('create_enterprise_partner_campaign',{p_network_id:networkId,p_name:name,p_campaign_type:campaignType,p_goal:goal}),
    updateCampaign: async (campaignId,name,campaignType,goal,status) => rpc('enterprise_update_campaign',{p_campaign_id:campaignId,p_name:name,p_campaign_type:campaignType,p_goal:goal,p_status:status}),
    deleteCampaign: async campaignId => rpc('enterprise_delete_campaign',{p_campaign_id:campaignId}),
    listNetworkMembers: async networkId => rpc('enterprise_list_network_members',{p_network_id:networkId}).then(data=>data??[]),
    listPartnerBusinesses: async businessId => rpc('enterprise_list_partner_businesses',{p_business_id:businessId}).then(data=>data??[]),
    invitePartner: async (networkId,partnerBusinessId) => rpc('invite_enterprise_partner',{p_network_id:networkId,p_partner_business_id:partnerBusinessId}),
    setMembershipStatus: async (membershipId,status) => rpc('set_enterprise_partner_status',{p_membership_id:membershipId,p_status:status}),
    createAllocation: async (networkId,partnerBusinessId,campaignId,type='promotion',quantity=0,budgetCents=0,rationale='') => emit('allocation_created',await rpc('create_partner_allocation',{p_network_id:networkId,p_partner_business_id:partnerBusinessId,p_campaign_id:campaignId||null,p_type:type,p_quantity:Number(quantity)||0,p_budget_cents:Math.max(0,Math.round(Number(budgetCents)||0)),p_rationale:rationale||null}),{networkId,partnerBusinessId,campaignId}),
    activateAllocation: async allocationId => emit('allocation_activated',await rpc('activate_partner_allocation',{p_allocation_id:allocationId}),{allocationId}),
    commerceSnapshot: async (businessId,networkId,start,end) => {const [network,campaigns,members,partners,benchmark,allocationRoi]=await Promise.all([networkId?rpc('get_enterprise_partner_network',{p_network_id:networkId,p_start:start,p_end:end}):null,networkId?rpc('enterprise_list_network_campaigns',{p_network_id:networkId}):[],networkId?rpc('enterprise_list_network_members',{p_network_id:networkId}):[],businessId?rpc('enterprise_list_partner_businesses',{p_business_id:businessId}):[],networkId?rpc('get_partner_network_benchmark',{p_network_id:networkId,p_start:start,p_end:end}):null,networkId?rpc('get_partner_allocation_roi',{p_network_id:networkId,p_start:start,p_end:end}):null]);return Object.freeze({network,campaigns:safeArray(campaigns),members:safeArray(members),partners:safeArray(partners),benchmark,allocationRoi});},
    campaignOutcome: async (campaignId,partnerBusinessId,metrics={}) => emit('campaign_outcome',await rpc('record_enterprise_partner_campaign_outcome',{p_campaign_id:campaignId,p_partner_business_id:partnerBusinessId,p_visits:metrics.visits??0,p_check_ins:metrics.checkIns??0,p_reviews:metrics.reviews??0,p_preferred_uses:metrics.preferredUses??0,p_access_redemptions:metrics.accessRedemptions??0,p_promotion_redemptions:metrics.promotionRedemptions??0,p_attributed_users:metrics.attributedUsers??0,p_points_awarded:metrics.pointsAwarded??0}),{campaignId,partnerBusinessId}),
    qrEngagement: async payload => {if(!payload?.businessId||!payload?.locationId||!payload?.activityType)throw new Error('Business, location, and activity type are required.');return emit('qr_engagement',await rpc('record_business_engagement_attribution',{p_business_id:payload.businessId,p_location_id:payload.locationId,p_partner_network_id:payload.partnerNetworkId??null,p_campaign_id:payload.campaignId??null,p_activity_type:payload.activityType,p_source:payload.source??'qr',p_metadata:payload.metadata??{}}),payload);}
  });
}
