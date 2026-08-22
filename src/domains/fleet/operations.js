export function createFleetOperationsService(client) {
  if (!client) throw new Error('Supabase client is required.');
  return Object.freeze({
    access: async (businessId) => { const { data, error } = await client.rpc('has_fleet_access', { p_business_id: businessId }); if (error) throw error; return Boolean(data); },
    dashboard: async (businessId) => { const { data, error } = await client.rpc('fleet_dashboard_summary_v2', { p_business_id: businessId }); if (error) throw error; return data; },
    maintenanceComplete: async (businessId, maintenanceId, notes = '') => { const { data, error } = await client.rpc('fleet_complete_maintenance', { p_business_id: businessId, p_maintenance_id: maintenanceId, p_notes: notes }); if (error) throw error; return data; },
    resolveAlert: async (businessId, alertId, resolution) => { const { data, error } = await client.rpc('fleet_resolve_alert', { p_business_id: businessId, p_alert_id: alertId, p_resolution: resolution }); if (error) throw error; return data; },
    driverStatus: async (businessId, driverId, status) => { const { data, error } = await client.rpc('fleet_set_driver_status', { p_business_id: businessId, p_driver_id: driverId, p_status: status }); if (error) throw error; return data; },
    vehicleStatus: async (businessId, vehicleId, status) => { const { data, error } = await client.rpc('fleet_set_vehicle_status', { p_business_id: businessId, p_vehicle_id: vehicleId, p_status: status }); if (error) throw error; return data; },
    routeStatus: async (businessId, routeId, status) => { const { data, error } = await client.rpc('fleet_set_route_status', { p_business_id: businessId, p_route_id: routeId, p_status: status }); if (error) throw error; return data; },
    opportunities: async (businessId) => { const { data, error } = await client.rpc('fleet_service_opportunities_for_business', { p_business_id: businessId }); if (error) throw error; return data ?? []; }
  });
}
