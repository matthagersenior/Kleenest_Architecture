export function createProgressionService(client) {
  if (!client) throw new Error('Supabase client is required.');
  const rpc = (name, args = {}) => client.rpc(name, args).then(({ data, error }) => { if (error) throw error; return data; });
  return Object.freeze({
    dashboard: () => rpc('gamification_dashboard'),
    summary: () => rpc('get_progression_summary'),
    leaderboard: (limit = 25) => rpc('get_user_leaderboard', { p_limit: Number(limit) }),
    platformLeaderboard: (leaderboardKey, limit = 25) => rpc('get_platform_leaderboard', { p_leaderboard_key: leaderboardKey, p_limit: Number(limit) }),
    businessLeaderboard: (metric = 'check_ins', limit = 10) => rpc('get_business_leaderboard', { p_metric: metric, p_limit: Number(limit) }),
    contests: (limit = 10) => rpc('home_active_contests', { p_limit: Number(limit) }),
    events: (limit = 10) => rpc('home_active_events', { p_limit: Number(limit) }),
    joinContest: contestId => rpc('join_contest', { p_contest_id: contestId }),
    completeChallenge: challengeId => rpc('complete_progression_challenge', { p_challenge_id: challengeId }),
    rewardHistory: (limit = 50) => rpc('user_rewards_history', { p_limit: Number(limit) }),
    reviewRewards: reviewId => rpc('review_rewards_summary', { p_review_id: reviewId }),
    promotionRewards: redemptionId => rpc('promotion_redemption_rewards_summary', { p_redemption_id: redemptionId }),
    checkinRewards: checkinId => rpc('checkin_rewards_summary', { p_checkin_id: checkinId }),
  });
}
