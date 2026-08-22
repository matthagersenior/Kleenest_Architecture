export function createProgressionService(client) {
  if (!client) throw new Error('Supabase client is required.');
  const rpc = (name, args = {}) => client.rpc(name, args).then(({ data, error }) => { if (error) throw error; return data; });
  return Object.freeze({
    dashboard: () => rpc('gamification_dashboard'),
    summary: () => rpc('get_progression_summary'),
    leaderboard: (limit = 25) => rpc('get_user_leaderboard', { p_limit: Number(limit) }),
    contests: (limit = 10) => rpc('home_active_contests', { p_limit: Number(limit) }),
    events: (limit = 10) => rpc('home_active_events', { p_limit: Number(limit) }),
    joinContest: contestId => rpc('join_contest', { p_contest_id: contestId }),
  });
}
