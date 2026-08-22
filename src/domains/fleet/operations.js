export function createFleetOperationsService(client) {
  if (!client) throw new Error('Supabase client is required.');
  async function rpc(name, args = {}) { const { data, error } = await client.rpc(name, args); if (error) throw error; return data; }
  return Object.freeze({
    access: businessId => rpc('has_fleet_access', { p_business_id: businessId }).then(Boolean),
    dashboard: businessId => rpc('fleet_dashboard_summary_v2', { p_business_id: businessId }),
    maintenanceComplete: (businessId, maintenanceId, notes = '') => rpc('fleet_complete_maintenance', { p_business_id: businessId, p_maintenance_id: maintenanceId, p_notes: notes }),
    resolveAlert: (businessId, alertId, resolution) => rpc('fleet_resolve_alert', { p_business_id: businessId, p_alert_id: alertId, p_resolution: resolution }),
    driverStatus: (businessId, driverId, status) => rpc('fleet_set_driver_status', { p_business_id: businessId, p_driver_id: driverId, p_status: status }),
    vehicleStatus: (businessId, vehicleId, status) => rpc('fleet_set_vehicle_status', { p_business_id: businessId, p_vehicle_id: vehicleId, p_status: status }),
    routeStatus: (businessId, routeId, status) => rpc('fleet_set_route_status', { p_business_id: businessId, p_route_id: routeId, p_status: status }),
    opportunities: businessId => rpc('fleet_service_opportunities_for_business', { p_business_id: businessId }).then(data => data ?? []),
    intelligence: businessId => rpc('fleet_intelligence_summary', { p_business_id: businessId }),
    intelligenceAction: (businessId, opportunityId, actionType) => rpc('fleet_intelligence_action', { p_business_id: businessId, p_opportunity_id: opportunityId, p_action_type: actionType })
  });
}
