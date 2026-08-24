import { buildFleetRecommendations } from './recommendations.js';
import { buildNotificationCandidates } from './notifications.js';
export function createFleetOperationsService(client) {
  if (!client) throw new Error('Supabase client is required.');
  async function rpc(name,args={}){const{data,error}=await client.rpc(name,args);if(error)throw error;return data;}
  async function networkRecommendations(businessId){const rows=await rpc('fleet_service_opportunities_for_business',{p_business_id:businessId});return buildFleetRecommendations(rows??[]);}
  async function recordOperationalEvent(businessId,eventType,payload={}){try{return await rpc('record_fleet_operational_event',{p_business_id:businessId,p_event_type:eventType,p_payload:payload});}catch{return null;}}
  async function mutate(businessId,eventType,rpcName,args={}){const result=await rpc(rpcName,args);await recordOperationalEvent(businessId,eventType,{result});window.dispatchEvent(new CustomEvent('kleenest:fleet-updated',{detail:{businessId,eventType,result}}));return result;}
  return Object.freeze({
    access:businessId=>rpc('has_fleet_access',{p_business_id:businessId}).then(Boolean),
    dashboard:businessId=>rpc('fleet_dashboard_summary_v2',{p_business_id:businessId}),
    maintenanceComplete:(businessId,maintenanceId,notes='')=>mutate(businessId,'maintenance_completed','fleet_complete_maintenance',{p_business_id:businessId,p_maintenance_id:maintenanceId,p_notes:notes}),
    resolveAlert:(businessId,alertId,resolution)=>mutate(businessId,'alert_resolved','fleet_resolve_alert',{p_business_id:businessId,p_alert_id:alertId,p_resolution:resolution}),
    driverStatus:(businessId,driverId,status)=>mutate(businessId,'driver_status_updated','fleet_set_driver_status',{p_business_id:businessId,p_driver_id:driverId,p_status:status}),
    vehicleStatus:(businessId,vehicleId,status)=>mutate(businessId,'vehicle_status_updated','fleet_set_vehicle_status',{p_business_id:businessId,p_vehicle_id:vehicleId,p_status:status}),
    routeStatus:(businessId,routeId,status)=>mutate(businessId,'route_status_updated','fleet_set_route_status',{p_business_id:businessId,p_route_id:routeId,p_status:status}),
    operationalEvent:recordOperationalEvent,
    opportunities:businessId=>rpc('fleet_service_opportunities_for_business',{p_business_id:businessId}).then(data=>data??[]),
    recommendations:networkRecommendations,
    notificationCandidates:async(businessId,existingNotifications=[])=>buildNotificationCandidates(await networkRecommendations(businessId),{surface:'fleet',existingNotifications}),
    intelligence:async businessId=>{const[dashboard,opportunities]=await Promise.all([rpc('fleet_dashboard_summary_v2',{p_business_id:businessId}),rpc('fleet_service_opportunities_for_business',{p_business_id:businessId})]);const recommendations=buildFleetRecommendations(opportunities??[]);return{dashboard,opportunities:opportunities??[],recommendations,notifications:buildNotificationCandidates(recommendations,{surface:'fleet'})};},
    leaderboard:(businessId,metric='safety_score',targetType='driver',limit=20)=>rpc('get_fleet_leaderboard',{p_business_id:businessId,p_metric:metric,p_target_type:targetType,p_limit:limit}),
    networkLeaderboard:(metric='stops_completed',limit=20)=>rpc('get_fleet_network_leaderboard',{p_metric:metric,p_limit:limit}),
    platformLeaderboard:(key='users:points',limit=20)=>rpc('get_platform_leaderboard',{p_leaderboard_key:key,p_limit:limit})
  });
}