export function createGeofencingService(client) {
  if (!client) throw new Error('Supabase client is required.');
  async function requireUser() { const { data: { user }, error } = await client.auth.getUser(); if (error) throw error; if (!user) throw new Error('Sign in to continue.'); return user; }
  const rpc = async (name, args = {}) => { await requireUser(); const { data, error } = await client.rpc(name, args); if (error) throw error; return data; };
  return Object.freeze({
    notifyNearby: (locationId, distanceMeters = 100, category = 'restroom') => rpc('create_gps_geofence_notification', { p_location_id: locationId, p_distance_m: distanceMeters, p_category: category }),
    recordEvent: payload => rpc('record_geofence_event', { p_geofence_id: payload.geofenceId, p_user_id: payload.userId ?? null, p_location_id: payload.locationId, p_business_id: payload.businessId ?? null, p_event_type: payload.eventType, p_dwell_seconds: payload.dwellSeconds ?? null, p_metadata: payload.metadata ?? {}, p_notification_id: payload.notificationId ?? null, p_qr_code_id: payload.qrCodeId ?? null, p_check_in_id: payload.checkInId ?? null }),
    publishLocation: (eventType, locationId, payload = {}, dedupeKey = null, expiresAt = null) => rpc('publish_location_notification', { p_event_type: eventType, p_location_id: locationId, p_payload: payload, p_dedupe_key: dedupeKey, p_expires_at: expiresAt }),
    recipients: (locationId, radiusMeters = 250) => rpc('resolve_nearby_notification_recipients', { p_location_id: locationId, p_radius_m: radiusMeters })
  });
}
