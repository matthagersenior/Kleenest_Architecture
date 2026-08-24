import{createCapabilityCoverageService}from'../entitlements/coverage.js';
export function createFleetStatusService(client,{coverage=createCapabilityCoverageService(client)}={}){
  if(!client)throw new Error('Supabase client is required.');
  const rpc=(name,args)=>client.rpc(name,args).then(({data,error})=>{if(error)throw error;return data;});
  const access=async(featureCode,outcome,metadata={})=>{try{await coverage.record({featureCode,outcome,tierCode:'fleet',destination:'fleet_operations',metadata})}catch{}};
  const mutate=(featureCode,name,args,metadata={})=>rpc(name,args).then(async data=>{await access(featureCode,'allowed',metadata);return data}).catch(async error=>{await access(featureCode,'blocked',{...metadata,error:error?.message});throw error});
  const setVehicleStatus=(businessId,vehicleId,status)=>mutate('fleet.vehicle_status','fleet_set_vehicle_status',{p_business_id:businessId,p_vehicle_id:vehicleId,p_status:status},{businessId,vehicleId,status});
  const setDriverStatus=(businessId,driverId,status)=>mutate('fleet.driver_status','fleet_set_driver_status',{p_business_id:businessId,p_driver_id:driverId,p_status:status},{businessId,driverId,status});
  const setRouteStatus=(businessId,routeId,status)=>mutate('fleet.route_status','fleet_set_route_status',{p_business_id:businessId,p_route_id:routeId,p_status:status},{businessId,routeId,status});
  return Object.freeze({
    setVehicleStatus,setDriverStatus,setRouteStatus,
    vehicleStatus:setVehicleStatus,driverStatus:setDriverStatus,routeStatus:setRouteStatus,
    completeRoute:(routeId)=>mutate('fleet.route_complete','complete_route',{p_route_id:routeId},{routeId}),
    publishRouteNotification:(routeId,eventType,title,body,payload={})=>mutate('fleet.route_notification','publish_fleet_route_notification',{p_route_id:routeId,p_event_type:eventType,p_title:title,p_body:body,p_payload:payload},{routeId,eventType})
  });
}
