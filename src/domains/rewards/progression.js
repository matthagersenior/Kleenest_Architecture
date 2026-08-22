export function createProgressionService(client) {
  if (!client) throw new Error('Supabase client is required.');

  async function requireUser() {
    const { data: { user }, error } = await client.auth.getUser();
    if (error) throw error;
    if (!user) throw new Error('Sign in to continue.');
    return user;
  }

  return Object.freeze({
    history: async (limit = 50) => {
      await requireUser();
      const { data, error } = await client.rpc('user_rewards_history', { p_limit: Number(limit) });
      if (error) throw error;
      return data;
    },

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

    refreshMilestones: async () => {
      const user = await requireUser();
      const { data, error } = await client.rpc('refresh_contributor_milestones', { p_user_id: user.id });
      if (error) throw error;
      return data ?? [];
    }
  });
}
