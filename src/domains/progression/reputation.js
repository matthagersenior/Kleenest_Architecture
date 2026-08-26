export function createReputationService(client) {
  if (!client) throw new Error('Supabase client is required.');
  function emit(type, detail) { if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(`kleenest:${type}`, { detail })); }
  return Object.freeze({
    get: async (userId) => {
      if (!userId) throw new Error('User is required.');
      const { data, error } = await client.from('contributor_reputation').select('*').eq('user_id', userId).maybeSingle();
      if (error) throw error;
      return data;
    },
    refresh: async (userId, reason = 'contribution') => {
      if (!userId) throw new Error('User is required.');
      const { data, error } = await client.rpc('refresh_contributor_reputation', { p_user_id: userId });
      if (error) throw error;
      emit('reputation-updated', { userId, reason, reputation: data });
      return data;
    },
    refreshAfterContribution: async (userId, { type = 'contribution', locationId = null, checkInId = null, reviewId = null, observationId = null } = {}) => {
      const reputation = await (async () => {
        if (!userId) throw new Error('User is required.');
        const { data, error } = await client.rpc('refresh_contributor_reputation', { p_user_id: userId });
        if (error) throw error;
        return data;
      })();
      emit('reputation-updated', { userId, reason: type, locationId, checkInId, reviewId, observationId, reputation });
      emit('evidence-loop-completed', { type, locationId, checkInId, reviewId, observationId, reputation });
      return reputation;
    }
  });
}
