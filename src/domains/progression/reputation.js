export function createReputationService(client) {
  if (!client) throw new Error('Supabase client is required.');
  return Object.freeze({
    get: async (userId) => { const { data, error } = await client.from('contributor_reputation').select('*').eq('user_id', userId).maybeSingle(); if (error) throw error; return data; },
    refresh: async (userId) => { const { data, error } = await client.rpc('refresh_contributor_reputation', { p_user_id: userId }); if (error) throw error; return data; }
  });
}
