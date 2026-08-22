export function createConsumerEngagementService(client) {
  if (!client) throw new Error('Supabase client is required.');
  const rpc = async (name, params = {}) => { const { data, error } = await client.rpc(name, params); if (error) throw error; return data; };
  return Object.freeze({
    preferred: {
      canActivate: locationId => rpc('can_activate_preferred_location', { p_location_id: locationId }),
      eligibility: locationId => rpc('check_preferred_eligibility', { p_location_id: locationId }),
      activate: locationId => rpc('activate_preferred_location', { p_location_id: locationId }),
      deactivate: locationId => rpc('deactivate_preferred_location', { p_location_id: locationId }),
      use: locationId => rpc('record_preferred_location_use', { p_location_id: locationId }),
      summary: () => rpc('business_preferred_location_summary')
    },
    promotions: {
      redeem: (promotionId, locationId) => rpc('redeem_promotion', { p_promotion_id: promotionId, p_location_id: locationId }),
      redemptionSummary: promotionId => rpc('promotion_redemption_summary', { p_promotion_id: promotionId })
    },
    contests: {
      active: limit => rpc('home_active_contests', { p_limit: limit ?? 10 }),
      join: contestId => rpc('join_contest', { p_contest_id: contestId }),
      submitEntry: (contestId, entry) => rpc('submit_contest_entry', { p_contest_id: contestId, p_entry: entry || {} }),
      score: (contestId, userId) => rpc('contest_score', { p_contest_id: contestId, p_user_id: userId })
    },
    events: {
      active: limit => rpc('home_active_events', { p_limit: limit ?? 10 })
    }
  });
}
