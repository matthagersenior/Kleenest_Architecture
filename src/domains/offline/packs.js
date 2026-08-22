export function createOfflinePackService(client) {
  if (!client) throw new Error('Supabase client is required.');
  return Object.freeze({
    create: async ({ packType, name, businessId = null, routeDiscoverySessionId = null, west, south, east, north, expiresHours = 24 }) => {
      const { data, error } = await client.rpc('create_offline_pack', {
        p_pack_type: packType, p_name: name, p_business_id: businessId,
        p_route_discovery_session_id: routeDiscoverySessionId,
        p_west: west, p_south: south, p_east: east, p_north: north,
        p_expires_hours: expiresHours
      });
      if (error) throw error;
      return data;
    }
  });
}
