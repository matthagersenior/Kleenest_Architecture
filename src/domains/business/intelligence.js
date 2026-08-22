export function createBusinessIntelligenceService(client){
  if(!client) throw new Error('Supabase client is required.');
  const rpc=(name,args={})=>client.rpc(name,args).then(({data,error})=>{if(error)throw error;return data;});
  const windowArgs=(businessId,start,end)=>({p_business_id:businessId,p_start:start,p_end:end});
  return Object.freeze({
    dashboard:(businessId,start,end)=>rpc('business_dashboard_secure_summary',windowArgs(businessId,start,end)),
    summary:(businessId,start,end)=>rpc('business_summary_analytics',windowArgs(businessId,start,end)),
    engagement:(businessId,start,end)=>rpc('business_engagement_analytics',windowArgs(businessId,start,end)),
    funnel:(businessId,start,end)=>rpc('get_business_engagement_funnel',windowArgs(businessId,start,end)),
    growth:(businessId,start,end)=>rpc('business_growth_analytics',windowArgs(businessId,start,end)),
    visitors:(businessId,start,end)=>rpc('business_visitors_analytics',windowArgs(businessId,start,end)),
    location:(businessId,start,end)=>rpc('business_location_analytics',windowArgs(businessId,start,end)),
    locationIntelligence:(businessId,start,end)=>rpc('business_location_intelligence',windowArgs(businessId,start,end)),
    occupancy:(businessId,start,end)=>rpc('business_occupancy_analytics',windowArgs(businessId,start,end)),
    reviews:(businessId,start,end)=>rpc('business_review_analytics',windowArgs(businessId,start,end)),
    amenities:(businessId,locationId,start,end)=>rpc('business_amenity_feedback_analytics',{...windowArgs(businessId,start,end),p_location_id:locationId}),
    campaigns:(businessId,start,end)=>rpc('business_campaign_analytics',windowArgs(businessId,start,end)),
    promotions:(businessId,start,end)=>rpc('business_promotion_analytics',windowArgs(businessId,start,end)),
    qr:(businessId,start,end)=>rpc('business_qr_analytics',windowArgs(businessId,start,end)),
    media:(businessId,start,end)=>rpc('business_media_analytics',windowArgs(businessId,start,end)),
    events:(businessId,start,end)=>rpc('business_event_analytics',windowArgs(businessId,start,end)),
    partners:(businessId,start,end)=>rpc('business_partner_analytics',windowArgs(businessId,start,end)),
    rewards:(businessId,start,end)=>rpc('business_rewards_analytics',windowArgs(businessId,start,end)),
    roi:(businessId,start,end)=>rpc('business_roi_analytics',windowArgs(businessId,start,end)),
    benchmark:(businessId,start,end)=>rpc('business_benchmark_analytics',windowArgs(businessId,start,end)),
  });
}
