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
    challenges: (limit = 25) => rpc('get_active_challenges', { p_limit: Number(limit) }),
    rewardHistory: (limit = 50) => rpc('get_reward_history', { p_limit: Number(limit) }),
    reviewReward: reviewId => rpc('reward_review_for_user', { p_review_id: reviewId }),
    promotionReward: redemptionId => rpc('reward_promotion_redemption', { p_redemption_id: redemptionId }),
    rewardCatalog: (limit = 50) => rpc('get_reward_catalog', { p_limit: Number(limit) }),
    redeemReward: rewardId => rpc('redeem_reward', { p_reward_id: rewardId }),
  });
}
