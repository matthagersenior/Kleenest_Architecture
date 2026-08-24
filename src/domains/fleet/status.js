export function createFleetStatusService(client){
  if(!client)throw new Error('Supabase client is required.');
  const rpc=(name,args)=>client.rpc(name,args).then(({data,error})=>{if(error)throw error;return data;});
  const setVehicleStatus=(businessId,vehicleId,status)=>rpc('fleet_set_vehicle_status',{p_business_id:businessId,p_vehicle_id:vehicleId,p_status:status});
  const setDriverStatus=(businessId,driverId,status)=>rpc('fleet_set_driver_status',{p_business_id:businessId,p_driver_id:driverId,p_status:status});
  const setRouteStatus=(businessId,routeId,status)=>rpc('fleet_set_route_status',{p_business_id:businessId,p_route_id:routeId,p_status:status});
  return Object.freeze({
    setVehicleStatus,setDriverStatus,setRouteStatus,
    vehicleStatus:setVehicleStatus,driverStatus:setDriverStatus,routeStatus:setRouteStatus,
    completeRoute:routeId=>rpc('complete_route',{p_route_id:routeId}),
    publishRouteNotification:(routeId,eventType,title,body,payload={})=>rpc('publish_fleet_route_notification',{p_route_id:routeId,p_event_type:eventType,p_title:title,p_body:body,p_payload:payload})
  });
}
