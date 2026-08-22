export function createCheckInService(client) {
  if (!client) throw new Error('Supabase client is required.');

  async function requireUser() {
    const { data: { user }, error } = await client.auth.getUser();
    if (error) throw error;
    if (!user) throw new Error('Sign in to continue.');
    return user;
  }

  return Object.freeze({
    byQr: async ({ placeId, qrToken }) => {
      await requireUser();
      if (!placeId || !qrToken) throw new Error('Place and QR token are required.');
      const { data, error } = await client.rpc('create_check_in', { p_place_id: placeId, p_qr_token: qrToken });
      if (error) throw error;
      return data;
    },

    byGps: async ({ latitude, longitude, radiusMeters = 100 }) => {
      await requireUser();
      const { data, error } = await client.rpc('record_gps_checkin', {
        p_lat: Number(latitude), p_lng: Number(longitude), p_radius_meters: Number(radiusMeters)
      });
      if (error) throw error;
      return data;
    },

    fromMap: async ({ locationId, latitude, longitude }) => {
      await requireUser();
      const { data, error } = await client.rpc('kleenest_map_check_in', {
        p_location_id: locationId, p_lat: Number(latitude), p_lng: Number(longitude)
      });
      if (error) throw error;
      return data;
    },

    verifyQr: async ({ qrCode, latitude, longitude }) => {
      await requireUser();
      const { data, error } = await client.rpc('verify_checkin', {
        p_qr_code: qrCode, p_lat: Number(latitude), p_lng: Number(longitude)
      });
      if (error) throw error;
      return data;
    },

    rewardsSummary: async (checkInId) => {
      const { data, error } = await client.rpc('checkin_rewards_summary', { p_checkin_id: checkInId });
      if (error) throw error;
      return data;
    }
  });
}
