export function createBusinessEngagementService(client){
  if(!client) throw new Error('Supabase client is required.');
  const rpc=(name,args={})=>client.rpc(name,args).then(({data,error})=>{if(error)throw error;return data;});
  return Object.freeze({
    analytics:(businessId,start,end)=>rpc('business_engagement_analytics',{p_business_id:businessId,p_start:start,p_end:end}),
    funnel:(businessId,start,end)=>rpc('get_business_engagement_funnel',{p_business_id:businessId,p_start:start,p_end:end}),
    attribution:(businessId,locationId,networkId,campaignId,activityType='engagement',source='consumer',metadata={})=>rpc('record_business_engagement_attribution',{p_business_id:businessId,p_location_id:locationId,p_partner_network_id:networkId,p_campaign_id:campaignId,p_activity_type:activityType,p_source:source,p_metadata:metadata}),
    locationMetrics:locationId=>rpc('location_engagement_metrics',{p_location_id:locationId}),
    createQrProgram:(qrCodeId,programType,name,description,rewardConfig={},triggerCount=1)=>rpc('create_qr_engagement_program',{p_qr_code_id:qrCodeId,p_program_type:programType,p_name:name,p_description:description,p_reward_config:rewardConfig,p_trigger_count:triggerCount}),
    listQrPrograms:qrCodeId=>rpc('list_qr_engagement_programs',{p_qr_code_id:qrCodeId})
  });
}
