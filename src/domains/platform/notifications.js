export function createNotificationService(client) {
  if (!client) throw new Error('Supabase client is required.');
  const rpc = async (name, params = {}) => { const { data, error } = await client.rpc(name, params); if (error) throw error; return data; };
  return Object.freeze({
    inbox: { list: limit => rpc('user_notifications', { p_limit: Math.min(Math.max(Number(limit) || 50, 1), 100) }), read: notificationId => rpc('mark_notification_read', { p_notification_id: notificationId }) },
    push: {
      register: (endpoint, subscription) => rpc('register_notification_push_subscription', { p_endpoint: endpoint, p_subscription: subscription }),
      remove: endpoint => rpc('remove_notification_push_subscription', { p_endpoint: endpoint })
    },
    intelligence: {
      create: args => rpc('create_intelligence_notification', args)
    },
    location: {
      createGpsGeofence: (locationId, distanceM, category = null) => rpc('create_gps_geofence_notification', { p_location_id: locationId, p_distance_m: distanceM, p_category: category })
    },
    fleet: {
      publishRoute: (routeId, eventType, title, body, payload = {}) => rpc('publish_fleet_route_notification', { p_route_id: routeId, p_event_type: eventType, p_title: title, p_body: body, p_payload: payload })
    },
    business: {
      recordAttribution: (businessId, locationId = null, partnerNetworkId = null, campaignId = null, activityType = 'engagement', source = 'consumer', metadata = {}) => rpc('record_business_engagement_attribution', { p_business_id: businessId, p_location_id: locationId, p_partner_network_id: partnerNetworkId, p_campaign_id: campaignId, p_activity_type: activityType, p_source: source, p_metadata: metadata })
    }
  });
}
