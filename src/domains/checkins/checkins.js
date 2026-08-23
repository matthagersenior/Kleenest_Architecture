import { createLiveNetworkService, LIVE_EVENT_TYPES } from '../live/network.js';

export function createCheckInService(client) {
  if (!client) throw new Error('Supabase client is required.');
  const live = createLiveNetworkService(client);
  async function requireUser() { const { data: { user }, error } = await client.auth.getUser(); if (error) throw error; if (!user) throw new Error('Sign in to continue.'); return user; }
  async function publishCheckIn(locationId, payload) { if (!locationId) return null; try { return await live.publish({ type: LIVE_EVENT_TYPES.QR_CHECK_IN, locationId, payload }); } catch { return null; } }
  return Object.freeze({
    byQr: async ({ placeId, qrToken }) => { await requireUser(); if (!placeId || !qrToken) throw new Error('Place and QR token are required.'); const { data, error } = await client.rpc('create_check_in', { p_place_id: placeId, p_qr_token: qrToken }); if (error) throw error; await publishCheckIn(placeId, { method: 'qr', result: data }); return data; },
    byGps: async ({ latitude, longitude, radiusMeters = 100, locationId = null }) => { await requireUser(); const { data, error } = await client.rpc('record_gps_checkin', { p_lat: Number(latitude), p_lng: Number(longitude), p_radius_meters: Number(radiusMeters) }); if (error) throw error; await publishCheckIn(locationId || data?.location_id || data?.place_id || null, { method: 'gps', latitude: Number(latitude), longitude: Number(longitude), result: data }); return data; },
    fromMap: async ({ locationId, latitude, longitude }) => { await requireUser(); if (!locationId) throw new Error('Location is required.'); const { data, error } = await client.rpc('kleenest_map_check_in', { p_location_id: locationId, p_lat: Number(latitude), p_lng: Number(longitude) }); if (error) throw error; await publishCheckIn(locationId, { method: 'map', latitude: Number(latitude), longitude: Number(longitude), result: data }); return data; },
    verifyQr: async ({ qrCode, latitude, longitude }) => { await requireUser(); const { data, error } = await client.rpc('verify_checkin', { p_qr_code: qrCode, p_lat: Number(latitude), p_lng: Number(longitude) }); if (error) throw error; await publishCheckIn(data?.location_id || data?.place_id || null, { method: 'verified_qr', latitude: Number(latitude), longitude: Number(longitude), result: data }); return data; },
    rewardsSummary: async checkInId => { const { data, error } = await client.rpc('checkin_rewards_summary', { p_checkin_id: checkInId }); if (error) throw error; return data; },
    leaderboard: (limit = 25) => client.rpc('get_user_leaderboard', { p_limit: Number(limit) }).then(({ data, error }) => { if (error) throw error; return data; }),
    platformLeaderboard: (leaderboardKey, limit = 25) => client.rpc('get_platform_leaderboard', { p_leaderboard_key: leaderboardKey, p_limit: Number(limit) }).then(({ data, error }) => { if (error) throw error; return data; })
  });
}
