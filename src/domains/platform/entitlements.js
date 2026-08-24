export function createEntitlementsService(client){
  if(!client) throw new Error('Supabase client is required.');
  const rpc=(name,args={})=>client.rpc(name,args).then(({data,error})=>{if(error)throw error;return data;});
  return Object.freeze({
    product:()=>rpc('get_current_user_product_entitlements'),
    consumerTier:(userId)=>rpc('get_effective_consumer_tier',{p_user_id:userId}),
    partnerMemberships:()=>rpc('list_my_partner_memberships'),
    syncBusinessService:(businessId)=>rpc('sync_business_service_entitlement',{p_business_id:businessId}),
    setBusinessTier:(businessId,tier)=>rpc('admin_set_business_tier',{p_business_id:businessId,p_tier:tier}),
    businessTier:(businessId)=>rpc('get_business_service_entitlement',{p_business_id:businessId}),
    businessLocationCap:(businessId)=>rpc('get_business_location_cap',{p_business_id:businessId}),
    engagementAuthorized:(businessId)=>rpc('business_engagement_authorized',{p_business_id:businessId}),
    qrAuthorized:(businessId)=>rpc('business_qr_authorized',{p_business_id:businessId}),
    enterpriseAuthorized:(businessId)=>rpc('business_enterprise_authorized',{p_business_id:businessId}),
    fleetAuthorized:(businessId)=>rpc('business_fleet_authorized',{p_business_id:businessId}),
    questCreatorAuthorized:(ownerType,ownerId)=>rpc('quest_creator_authorized',{p_owner_type:ownerType,p_owner_id:ownerId}),
    fleetMetricControllerAuthorized:(businessId)=>rpc('fleet_metric_controller_authorized',{p_business_id:businessId}),
  });
}