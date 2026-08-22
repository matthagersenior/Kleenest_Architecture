export function createFleetIntelligenceService(client){
  if(!client) throw new Error('Supabase client is required.');
  const rpc=(name,args={})=>client.rpc(name,args).then(({data,error})=>{if(error)throw error;return data;});
  return Object.freeze({
    dashboard:businessId=>rpc('fleet_dashboard_summary_v2',{p_business_id:businessId}),
    opportunities:businessId=>rpc('fleet_service_opportunities_for_business',{p_business_id:businessId}).then(data=>data??[]),
    intelligence:async businessId=>Promise.all([rpc('fleet_dashboard_summary_v2',{p_business_id:businessId}),rpc('fleet_service_opportunities_for_business',{p_business_id:businessId})]),
    leaderboard:(businessId,metric='safety_score',targetType='driver',limit=20)=>rpc('get_fleet_leaderboard',{p_business_id:businessId,p_metric:metric,p_target_type:targetType,p_limit:limit}),
    networkLeaderboard:(metric='stops_completed',limit=20)=>rpc('get_fleet_network_leaderboard',{p_metric:metric,p_limit:limit}),
    platformLeaderboard:(key='users:points',limit=20)=>rpc('get_platform_leaderboard',{p_leaderboard_key:key,p_limit:limit})
  });
}
