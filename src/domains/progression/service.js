export function createProgressionService(client) {
  if (!client) throw new Error('Supabase client is required.');
  const rpc = (name, args = {}) => client.rpc(name, args).then(({ data, error }) => { if (error) throw error; return data; });
  const requireUser = async () => { const { data: { user }, error } = await client.auth.getUser(); if (error) throw error; if (!user) throw new Error('Sign in to continue.'); return user; };
  return Object.freeze({
    dashboard: () => rpc('gamification_dashboard'),
    summary: () => rpc('get_progression_summary'),
    leaderboard: (limit = 25) => rpc('get_user_leaderboard', { p_limit: Number(limit) }),
    platformLeaderboard: (leaderboardKey, limit = 25) => rpc('get_platform_leaderboard', { p_leaderboard_key: leaderboardKey, p_limit: Number(limit) }),
    businessLeaderboard: (metric = 'check_ins', limit = 10) => rpc('get_business_leaderboard', { p_metric: metric, p_limit: Number(limit) }),
    contests: (limit = 10) => rpc('home_active_contests', { p_limit: Number(limit) }),
    events: (limit = 10) => rpc('home_active_events', { p_limit: Number(limit) }),
    challenges: async (limit = 25) => { await requireUser(); const { data, error } = await client.from('progression_challenges').select('id,code,name,description,challenge_type,target,reward_points,reward_badge_code,period,enabled,created_at,metrics_config').eq('enabled', true).order('created_at', { ascending: false }).limit(Math.min(Math.max(Number(limit) || 25, 1), 100)); if (error) throw error; return data ?? []; },
    challengeProgress: async () => { const user = await requireUser(); const { data, error } = await client.from('user_progression_metric_summary').select('metric,quantity,points_awarded,event_count,last_occurred_at').eq('user_id', user.id); if (error) throw error; return data ?? []; },
    badges: async () => { const user = await requireUser(); const { data, error } = await client.from('user_badges').select('badge_id,earned_at,badges:badge_id(id,code,name,description,icon,criteria)').eq('user_id', user.id).order('earned_at', { ascending: false }); if (error) throw error; return (data ?? []).map(row => ({ ...(row.badges || {}), id: row.badge_id, earned_at: row.earned_at })); },
    evaluateBadges: async () => { const user = await requireUser(); return rpc('evaluate_user_badges', { p_user_id: user.id }); },
    milestones: async () => { const user = await requireUser(); const { data, error } = await client.from('contributor_milestones').select('milestone_key,achieved_at,points_awarded').eq('user_id', user.id).order('milestone_key'); if (error) throw error; return data ?? []; },
    refreshMilestones: async () => { const user = await requireUser(); return rpc('refresh_contributor_milestones', { p_user_id: user.id }); },
    joinContest: contestId => rpc('join_contest', { p_contest_id: contestId }),
    completeChallenge: challengeId => rpc('complete_progression_challenge', { p_challenge_id: challengeId }),
    rewardHistory: (limit = 50) => rpc('user_rewards_history', { p_limit: Number(limit) }),
    reviewRewards: reviewId => rpc('review_rewards_summary', { p_review_id: reviewId }),
    promotionRewards: redemptionId => rpc('promotion_redemption_rewards_summary', { p_redemption_id: redemptionId }),
    checkinRewards: checkinId => rpc('checkin_rewards_summary', { p_checkin_id: checkinId }),
  });
}
