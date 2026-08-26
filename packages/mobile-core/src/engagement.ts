import type { SupabaseClient } from '@supabase/supabase-js';

async function requireUser(client: SupabaseClient) {
  const { data, error } = await client.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error('Sign in to continue.');
  return data.user;
}

export function createMobileEngagementService(client: SupabaseClient) {
  return Object.freeze({
    async gpsCheckIn({ latitude, longitude, radiusMeters = 250 }: { latitude: number; longitude: number; radiusMeters?: number }) {
      await requireUser(client);
      const { data, error } = await client.rpc('record_gps_checkin', { p_lat: latitude, p_lng: longitude, p_radius_meters: radiusMeters });
      if (error) throw error;
      return data;
    },
    async mapCheckIn({ locationId, latitude, longitude }: { locationId: string; latitude: number; longitude: number }) {
      await requireUser(client);
      const { data, error } = await client.rpc('kleenest_map_check_in', { p_location_id: locationId, p_lat: latitude, p_lng: longitude });
      if (error) throw error;
      return data;
    },
    async qrCheckIn({ code, latitude, longitude }: { code: string; latitude?: number | null; longitude?: number | null }) {
      await requireUser(client);
      const { data, error } = await client.rpc('verify_checkin', { p_qr_code: code, p_lat: latitude ?? null, p_lng: longitude ?? null });
      if (error) throw error;
      return data;
    },
    async redeemQr(code: string) {
      const user = await requireUser(client);
      const { data, error } = await client.rpc('consume_single_use_qr', { p_code: code, p_user_id: user.id });
      if (error) throw error;
      return data;
    },
    async rewardsForCheckIn(checkInId: string) {
      await requireUser(client);
      const { data, error } = await client.rpc('checkin_rewards_summary', { p_checkin_id: checkInId });
      if (error) throw error;
      return data;
    },
    async rewardsHistory(limit = 25) {
      await requireUser(client);
      const { data, error } = await client.rpc('user_rewards_history', { p_limit: Math.min(Math.max(limit, 1), 100) });
      if (error) throw error;
      return data;
    },
    async completeChallenge(challengeId: string) {
      await requireUser(client);
      const { data, error } = await client.rpc('complete_progression_challenge', { p_challenge_id: challengeId });
      if (error) throw error;
      return data;
    },
  });
}
