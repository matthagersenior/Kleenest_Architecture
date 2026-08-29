import { createLiveNetworkService, LIVE_EVENT_TYPES } from '../live/network.js';

export function createCheckInService(client,{quests=null}={}) {
  if (!client) throw new Error('Supabase client is required.');
  const live = createLiveNetworkService(client);
  async function requireUser() { const { data: { user }, error } = await client.auth.getUser(); if (error) throw error; if (!user) throw new Error('Sign in to continue.'); return user; }
  function emit(type, detail) { if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(`kleenest:${type}`, { detail })); }
  async function reconcileRouteStop(locationId, checkInId) {
    if (!locationId || !checkInId) return null;
    try {
      const { data, error } = await client.rpc('arrive_active_route_stop', { p_location_id: locationId, p_check_in_id: checkInId });
      if (error) throw error;
      if (data?.matched) emit('route-stop-arrived', { locationId, checkInId, result: data });
      return data;
    } catch { return null; }
  }
  async function publishCheckIn(locationId, payload) { if (!locationId) return null; try { return await live.publish({ type: LIVE_EVENT_TYPES.QR_CHECK_IN, locationId, payload }); } catch { return null; } }
  async function completed(method, data, locationId) {
    const resolvedLocationId=locationId || data?.location_id || data?.place_id || null;
    const checkInId=data?.id || data?.check_in_id || data?.checkin_id || null;
    emit('checkin-completed', { method, checkIn: data, locationId: resolvedLocationId });
    await reconcileRouteStop(resolvedLocationId, checkInId);
    emit('progression-updated', { type: 'checkin_completed', method, checkIn: data });
    if (quests) { try { await quests.dispatchEvent('checkin', { locationId: resolvedLocationId, checkinId: checkInId, metadata:{method} }); } catch {} }
    return data;
  }
  async function currentPosition() { if (typeof navigator==='undefined'||!navigator.geolocation) throw new Error('Location services are unavailable.'); return new Promise((resolve,reject)=>navigator.geolocation.getCurrentPosition(resolve,reject,{enableHighAccuracy:true,timeout:12000,maximumAge:30000})); }
  async function leaveLocation({locationId,latitude,longitude}) { await requireUser(); if(!locationId) throw new Error('Location is required.'); const lat=Number(latitude),lng=Number(longitude); if(!Number.isFinite(lat)||!Number.isFinite(lng)) throw new Error('Current location is required to leave.'); const {data,error}=await client.rpc('record_location_departure',{p_location_id:locationId,p_lat:lat,p_lng:lng}); if(error) throw error; emit('location-departed',{locationId,...data}); emit('progression-updated',{type:'location_departed',locationId}); return data; }
  return Object.freeze({
    byQr: async ({ placeId, qrToken, latitude=null, longitude=null }) => { await requireUser(); if (!placeId || !qrToken) throw new Error('Place and QR token are required.'); let lat=Number(latitude),lng=Number(longitude); if(!Number.isFinite(lat)||!Number.isFinite(lng)){const pos=await currentPosition();lat=pos.coords.latitude;lng=pos.coords.longitude;} const { data, error } = await client.rpc('verify_checkin', { p_qr_code: qrToken, p_lat: lat, p_lng: lng }); if (error) throw error; const locationId=data?.location_id||data?.place_id||placeId; await publishCheckIn(locationId, { method: 'qr', latitude:lat, longitude:lng, result:data }); return completed('qr', data, locationId); },
    byGps: async ({ latitude, longitude, locationId = null }) => { await requireUser(); if (!locationId) throw new Error('Select a canonical location before using GPS verification.'); const { data, error } = await client.rpc('kleenest_map_check_in', { p_location_id: locationId, p_lat: Number(latitude), p_lng: Number(longitude) }); if (error) throw error; await publishCheckIn(locationId, { method: 'gps', latitude: Number(latitude), longitude: Number(longitude), result: data }); return completed('gps', data, locationId); },
    fromMap: async ({ locationId, latitude, longitude }) => { await requireUser(); if (!locationId) throw new Error('Location is required.'); const { data, error } = await client.rpc('kleenest_map_check_in', { p_location_id: locationId, p_lat: Number(latitude), p_lng: Number(longitude) }); if (error) throw error; await publishCheckIn(locationId, { method: 'map', latitude: Number(latitude), longitude: Number(longitude), result: data }); return completed('map', data, locationId); },
    verifyQr: async ({ qrCode, latitude, longitude }) => { await requireUser(); const { data, error } = await client.rpc('verify_checkin', { p_qr_code: qrCode, p_lat: Number(latitude), p_lng: Number(longitude) }); if (error) throw error; const resolvedLocationId=data?.location_id || data?.place_id || null; await publishCheckIn(resolvedLocationId, { method: 'verified_qr', latitude: Number(latitude), longitude: Number(longitude), result: data }); return completed('verified_qr', data, resolvedLocationId); },
    leaveLocation,
    rewardsSummary: async checkInId => { const { data, error } = await client.rpc('checkin_rewards_summary', { p_checkin_id: checkInId }); if (error) throw error; return data; },
    leaderboard: (limit = 25) => client.rpc('get_user_leaderboard', { p_limit: Number(limit) }).then(({ data, error }) => { if (error) throw error; return data; }),
    platformLeaderboard: (leaderboardKey, limit = 25) => client.rpc('get_platform_leaderboard', { p_leaderboard_key: leaderboardKey, p_limit: Number(limit) }).then(({ data, error }) => { if (error) throw error; return data; })
  });
}
