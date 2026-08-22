export function createContestService(client) {
  if (!client) throw new Error('Supabase client is required.');
  async function user() {
    const { data: { user }, error } = await client.auth.getUser();
    if (error) throw error;
    if (!user) throw new Error('Sign in to continue.');
    return user;
  }
  return Object.freeze({
    active: async (limit = 20) => { await user(); const { data, error } = await client.rpc('home_active_contests', { p_limit: limit }); if (error) throw error; return data ?? []; },
    join: async (contestId) => { await user(); const { data, error } = await client.rpc('join_contest', { p_contest_id: contestId }); if (error) throw error; return data; },
    submitEntry: async (contestId, entry = {}) => { await user(); const { data, error } = await client.rpc('submit_contest_entry', { p_contest_id: contestId, p_entry: entry }); if (error) throw error; return data; },
    score: async (contestId, userId) => { await user(); const { data, error } = await client.rpc('contest_score', { p_contest_id: contestId, p_user_id: userId }); if (error) throw error; return data; },
    leaderboard: async (metric, limit = 10) => { await user(); const { data, error } = await client.rpc('get_business_leaderboard', { p_metric: metric, p_limit: limit }); if (error) throw error; return data ?? []; }
  });
}
