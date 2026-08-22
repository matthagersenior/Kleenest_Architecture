export function createNotificationPreferencesService(client) {
  if (!client) throw new Error('Supabase client is required.');
  async function user() {
    const { data: { user }, error } = await client.auth.getUser();
    if (error) throw error;
    if (!user) throw new Error('Sign in to continue.');
    return user;
  }
  return Object.freeze({
    get: async () => {
      const me = await user();
      const { data, error } = await client.from('notification_preferences').select('user_id,intelligence,rewards,community,push,updated_at').eq('user_id', me.id).maybeSingle();
      if (error) throw error;
      return data;
    },
    update: async ({ intelligence, rewards, community, push }) => {
      const me = await user();
      const payload = { user_id: me.id };
      for (const [key, value] of Object.entries({ intelligence, rewards, community, push })) if (value !== undefined) payload[key] = Boolean(value);
      const { data, error } = await client.from('notification_preferences').upsert(payload, { onConflict: 'user_id' }).select('user_id,intelligence,rewards,community,push,updated_at').single();
      if (error) throw error;
      return data;
    }
  });
}
