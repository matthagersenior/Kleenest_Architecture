export function createFleetIntelligenceService(client){
  if(!client) throw new Error('Supabase client is required.');
  const requireBusinessId=value=>{if(!value||typeof value!=='string')throw new Error('Business is required.');return value};
  const limit=value=>Math.min(Math.max(Number(value)||20,1),100);
  const rpc=(name,args={})=>client.rpc(name,args).then(({data,error})=>{if(error)throw error;return data});
  const normalizeRows=data=>Array.isArray(data)?data:(data?.rows||data?.items||[]);
  const notification=(row,index=0)=>{const r=row||{};return {id:r.id||r.opportunity_id||r.alert_id||`fleet-signal-${index}`,title:r.title||r.name||r.vehicle_name||'Fleet operational signal',body:r.body||r.reason||r.description||r.details||'Fleet intelligence identified an operational signal requiring review.',priority:String(r.priority||r.severity||'normal').toLowerCase(),target_type:r.target_type||r.entity_type||null,target_id:r.target_id||r.vehicle_id||r.driver_id||r.route_id||null,action:r.action||r.recommended_action||'review',source:'fleet_intelligence'}};
  return Object.freeze({
    dashboard:businessId=>rpc('fleet_dashboard_summary_v2',{p_business_id:requireBusinessId(businessId)}),
    opportunities:businessId=>rpc('fleet_service_opportunities_for_business',{p_business_id:requireBusinessId(businessId)}).then(normalizeRows),
    notifications:async businessId=>normalizeRows(await rpc('fleet_service_opportunities_for_business',{p_business_id:requireBusinessId(businessId)})).map(notification),
    intelligence:async businessId=>{const id=requireBusinessId(businessId);const[dashboard,opportunities]=await Promise.all([rpc('fleet_dashboard_summary_v2',{p_business_id:id}),rpc('fleet_service_opportunities_for_business',{p_business_id:id})]);const rows=normalizeRows(opportunities);return{dashboard,opportunities:rows,notifications:rows.map(notification)}},
    leaderboard:(businessId,metric='safety_score',targetType='driver',count=20)=>rpc('get_fleet_leaderboard',{p_business_id:requireBusinessId(businessId),p_metric:String(metric||'safety_score'),p_target_type:String(targetType||'driver'),p_limit:limit(count)}),
    networkLeaderboard:(metric='stops_completed',count=20)=>rpc('get_fleet_network_leaderboard',{p_metric:String(metric||'stops_completed'),p_limit:limit(count)}),
    platformLeaderboard:(key='users:points',count=20)=>rpc('get_platform_leaderboard',{p_leaderboard_key:String(key||'users:points'),p_limit:limit(count)})
  });
}