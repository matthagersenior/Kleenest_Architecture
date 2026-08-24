export function createProgressionService(client) {
  if (!client) throw new Error('Supabase client is required.');

  async function requireUser() {
    const { data: { user }, error } = await client.auth.getUser();
    if (error) throw error;
    if (!user) throw new Error('Sign in to continue.');
    return user;
  }

  async function selectRows(table, columns, configure = null) {
    await requireUser();
    let query = client.from(table).select(columns);
    if (configure) query = configure(query);
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  }

  return Object.freeze({
    dashboard: async () => {
      await requireUser();
      const { data, error } = await client.rpc('gamification_dashboard');
      if (error) throw error;
      return data ?? {};
    },

    summary: async () => {
      await requireUser();
      const { data, error } = await client.rpc('get_progression_summary');
      if (error) throw error;
      return data ?? {};
    },

    leaderboard: async (limit = 15) => {
      await requireUser();
      const { data, error } = await client.rpc('get_user_leaderboard', { p_limit: Math.min(Math.max(Number(limit) || 15, 1), 50) });
      if (error) throw error;
      return data ?? [];
    },

    contests: async (limit = 10) => {
      await requireUser();
      const { data, error } = await client.rpc('home_active_contests', { p_limit: Math.min(Math.max(Number(limit) || 10, 1), 25) });
      if (error) throw error;
      return data ?? [];
    },

    events: async (limit = 10) => {
      await requireUser();
      // Business events are governed by business membership RLS. Keep the consumer
      // surface safe and useful by exposing RSVP history instead of bypassing it.
      const { data, error } = await client
        .from('event_rsvps')
        .select('event_id,created_at')
        .eq('user_id', (await client.auth.getUser()).data.user.id)
        .order('created_at', { ascending: false })
        .limit(Math.min(Math.max(Number(limit) || 10, 1), 25));
      if (error) throw error;
      return (data ?? []).map(row => ({ id: row.event_id, title: 'Event RSVP', created_at: row.created_at }));
    },

    history: async (limit = 50) => {
      await requireUser();
      const { data, error } = await client.rpc('user_rewards_history', { p_limit: Math.min(Math.max(Number(limit) || 50, 1), 100) });
      if (error) throw error;
      return data;
    },

    rewardHistory: async (limit = 50) => {
      const data = await this.history(limit);
      return data;
    },

    challenges: async (limit = 25) => selectRows('progression_challenges', 'id,code,name,description,challenge_type,target,reward_points,reward_badge_code,period,enabled,created_at,metrics_config', query => query.eq('enabled', true).order('created_at', { ascending: false }).limit(Math.min(Math.max(Number(limit) || 25, 1), 50))),

    challengeProgress: async (limit = 100) => selectRows('progression_metric_events', 'id,metric,source_type,source_id,quantity,points_awarded,metadata,created_at', query => query.order('created_at', { ascending: false }).limit(Math.min(Math.max(Number(limit) || 100, 1), 250))),

    badges: async () => {
      const rows = await selectRows('user_badges', 'badge_id,earned_at,badges(id,code,name,description,icon)');
      return rows.map(row => ({ ...(row.badges || {}), id: row.badge_id, earned_at: row.earned_at }));
    },

    milestones: async () => selectRows('contributor_milestones', 'user_id,milestone_key,achieved_at,points_awarded', query => query.order('achieved_at', { ascending: false, nullsFirst: false })),

    checkInSummary: async (checkInId) => {
      const { data, error } = await client.rpc('checkin_rewards_summary', { p_checkin_id: checkInId });
      if (error) throw error;
      return data;
    },

    reviewSummary: async (reviewId) => {
      const { data, error } = await client.rpc('review_rewards_summary', { p_review_id: reviewId });
      if (error) throw error;
      return data;
    },

    completeChallenge: async (challengeId) => {
      await requireUser();
      const { data, error } = await client.rpc('complete_progression_challenge', { p_challenge_id: challengeId });
      if (error) throw error;
      return data;
    },

    joinContest: async (contestId) => {
      await requireUser();
      const { data, error } = await client.rpc('join_contest', { p_contest_id: contestId });
      if (error) throw error;
      return data;
    },

    evaluateBadges: async () => {
      const user = await requireUser();
      const { data, error } = await client.rpc('evaluate_user_badges', { p_user_id: user.id });
      if (error) throw error;
      return data;
    },

    refreshMilestones: async () => {
      const user = await requireUser();
      const { data, error } = await client.rpc('refresh_contributor_milestones', { p_user_id: user.id });
      if (error) throw error;
      return data ?? [];
    }
  });
}
