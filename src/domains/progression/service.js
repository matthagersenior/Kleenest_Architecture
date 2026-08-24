export function createProgressionService(client) {
  if (!client) throw new Error('Supabase client is required.');
  const rpc = (name, args = {}) => client.rpc(name, args).then(({ data, error }) => { if (error) throw error; return data; });
  const boundedLimit = (value, fallback = 25, max = 100) => Math.min(Math.max(Number(value) || fallback, 1), max);
  const requireUser = async () => { const { data: { user }, error } = await client.auth.getUser(); if (error) throw error; if (!user) throw new Error('Sign in to continue.'); return user; };
  const publishRewardUpdate = (kind, result, user) => {
    if (typeof window !== 'undefined') {
      const detail = {
        profile: {
          id: user.id,
          points: Number(result?.profile?.points ?? 0),
          level: Number(result?.profile?.level ?? 1),
          streak: Number(result?.profile?.streak ?? 0),
          totalCheckIns: Number(result?.profile?.total_check_ins ?? 0),
          totalReviews: Number(result?.profile?.total_reviews ?? 0),
          source: 'supabase',
        },
        transactions: result?.point_transactions ?? result?.transactions ?? [],
        newBadges: result?.new_badges ?? [],
        badges: result?.badges ?? [],
        checkIn: result?.check_in ?? null,
        review: result?.review ?? null,
        redemption: result?.redemption ?? null,
        promotion: result?.promotion ?? null,
      };
      window.dispatchEvent(new CustomEvent('kleenest:rewards-updated', { detail }));
      window.dispatchEvent(new CustomEvent(`kleenest:${kind}-rewards-updated`, { detail }));
    }
    return result;
  };
  return Object.freeze({
    dashboard: async () => { await requireUser(); return rpc('gamification_dashboard'); },
    summary: async () => { await requireUser(); return rpc('get_progression_summary'); },
    leaderboard: (limit = 25) => rpc('get_user_leaderboard', { p_limit: boundedLimit(limit) }),
    platformLeaderboard: (leaderboardKey, limit = 25) => { if (!leaderboardKey) throw new Error('Leaderboard key is required.'); return rpc('get_platform_leaderboard', { p_leaderboard_key: leaderboardKey, p_limit: boundedLimit(limit) }); },
    businessLeaderboard: (metric = 'check_ins', limit = 10) => rpc('get_business_leaderboard', { p_metric: metric, p_limit: boundedLimit(limit, 10) }),
    contests: (limit = 10) => rpc('home_active_contests', { p_limit: boundedLimit(limit, 10) }),
    events: (limit = 10) => rpc('home_active_events', { p_limit: boundedLimit(limit, 10) }),
    challenges: async (limit = 25) => { await requireUser(); const { data, error } = await client.from('progression_challenges').select('id,code,name,description,challenge_type,target,reward_points,reward_badge_code,period,enabled,created_at,metrics_config').eq('enabled', true).order('created_at', { ascending: false }).limit(boundedLimit(limit)); if (error) throw error; return data ?? []; },
    challengeProgress: async () => { const user = await requireUser(); const { data, error } = await client.from('user_progression_metric_summary').select('metric,quantity,points_awarded,event_count,last_occurred_at').eq('user_id', user.id); if (error) throw error; return data ?? []; },
    badges: async () => { const user = await requireUser(); const { data, error } = await client.from('user_badges').select('badge_id,earned_at,badges:badge_id(id,code,name,description,icon,criteria)').eq('user_id', user.id).order('earned_at', { ascending: false }); if (error) throw error; return (data ?? []).map(row => ({ ...(row.badges || {}), id: row.badge_id, earned_at: row.earned_at })); },
    evaluateBadges: async () => { const user = await requireUser(); return rpc('evaluate_user_badges', { p_user_id: user.id }); },
    milestones: async () => { const user = await requireUser(); const { data, error } = await client.from('contributor_milestones').select('milestone_key,achieved_at,points_awarded').eq('user_id', user.id).order('milestone_key'); if (error) throw error; return data ?? []; },
    refreshMilestones: async () => { const user = await requireUser(); return rpc('refresh_contributor_milestones', { p_user_id: user.id }); },
    joinContest: async contestId => { await requireUser(); if (!contestId) throw new Error('Contest is required.'); return rpc('join_contest', { p_contest_id: contestId }); },
    completeChallenge: async challengeId => { await requireUser(); if (!challengeId) throw new Error('Challenge is required.'); return rpc('complete_progression_challenge', { p_challenge_id: challengeId }); },
    rewardHistory: async (limit = 50) => { await requireUser(); return rpc('user_rewards_history', { p_limit: boundedLimit(limit, 50) }); },
    reviewRewards: async reviewId => { if (!reviewId) throw new Error('Review is required.'); const user = await requireUser(); return publishRewardUpdate('review', await rpc('review_rewards_summary', { p_review_id: reviewId }), user); },
    promotionRewards: async redemptionId => { if (!redemptionId) throw new Error('Redemption is required.'); const user = await requireUser(); return publishRewardUpdate('promotion', await rpc('promotion_redemption_rewards_summary', { p_redemption_id: redemptionId }), user); },
    checkinRewards: async checkInId => { if (!checkInId) throw new Error('Check-in is required.'); const user = await requireUser(); return publishRewardUpdate('checkin', await rpc('checkin_rewards_summary', { p_checkin_id: checkInId }), user); },
  });
}
