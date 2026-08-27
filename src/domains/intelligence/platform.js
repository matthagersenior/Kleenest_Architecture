export function createPlatformIntelligenceService(client){
  if(!client) throw new Error('Supabase client is required.');
  const rpc=(name,args={})=>client.rpc(name,args).then(({data,error})=>{if(error)throw error;return data;});
  const rows=value=>Array.isArray(value)?value:(value&&typeof value==='object'&&Array.isArray(value.rows)?value.rows:[]);
  return Object.freeze({
    crossTierLeaderboard:async(key='consumer_checkins',limit=25)=>rows(await rpc('get_cross_tier_leaderboard',{p_leaderboard_key:key,p_limit:Number(limit)})),
    platformLeaderboard:async(key='users:points',limit=20)=>rows(await rpc('get_platform_leaderboard',{p_leaderboard_key:key,p_limit:Number(limit)})),
    fleetNetworkLeaderboard:async(metric='stops_completed',limit=20)=>rows(await rpc('get_fleet_network_leaderboard',{p_metric:metric,p_limit:Number(limit)})),
    businessLeaderboard:async(metric='check_ins',limit=10)=>rows(await rpc('get_business_leaderboard',{p_metric:metric,p_limit:Number(limit)})),
    recordParticipation:(key,actorId,actorType,value,event,sourceId=null,metadata={})=>rpc('record_network_leaderboard_participation',{p_leaderboard_key:key,p_actor_id:actorId,p_actor_type:actorType,p_metric_value:value,p_source_event:event,p_source_id:sourceId,p_metadata:metadata}),
    refreshLeaderboards:()=>rpc('refresh_business_metric_leaderboards'),
    publishLocationEvent:(eventType,locationId,payload={})=>rpc('publish_location_notification',{p_event_type:eventType,p_location_id:locationId,p_payload:payload}),
    createIntelligenceNotification:(userId,locationId,surface,type,dedupeKey,title,body,data={})=>rpc('create_intelligence_notification',{p_user_id:userId,p_location_id:locationId,p_surface:surface,p_type:type,p_dedupe_key:dedupeKey,p_title:title,p_body:body,p_data:data}),
    searchLocations:async(query,limit=8)=>rows(await rpc('search_locations',{search_text:String(query||'').trim(),max_results:Number(limit)})),
    semanticSearch:async(query,lat=null,lng=null,radius=5000,limit=8)=>rows(await rpc('semantic_location_search',{p_query:String(query||'').trim(),p_lat:lat,p_lng:lng,p_radius_m:Number(radius),p_limit:Number(limit)})),
    locationRecommendation:async(locationId)=>rpc('get_location_recommendation_summary',{p_location_id:locationId}),
    bathroomIntelligence:async(locationId)=>rpc('get_public_restroom_intelligence',{p_place_id:locationId}),
  });
}
