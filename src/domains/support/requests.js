export function createSupportService(client) {
  if (!client) throw new Error('Supabase client is required.');
  async function user() {
    const { data: { user }, error } = await client.auth.getUser();
    if (error) throw error;
    if (!user) throw new Error('Sign in to continue.');
    return user;
  }
  return Object.freeze({
    create: async ({ subject, message, category = 'general', metadata = {} }) => {
      const me = await user();
      if (!String(subject ?? '').trim() || !String(message ?? '').trim()) throw new Error('Subject and message are required.');
      const { data, error } = await client.from('support_requests').insert({ user_id: me.id, subject: String(subject).trim(), message: String(message).trim(), category, metadata }).select().single();
      if (error) throw error;
      return data;
    },
    listMine: async () => {
      const me = await user();
      const { data, error } = await client.from('support_requests').select('*').eq('user_id', me.id).order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    feedback: async ({ message, category = 'general', metadata = {} }) => {
      const me = await user();
      const { data, error } = await client.from('user_feedback').insert({ user_id: me.id, message: String(message ?? '').trim(), category, metadata }).select().single();
      if (error) throw error;
      return data;
    },
    requestAccountDeletion: async (reason = null) => {
      const me = await user();
      const { data, error } = await client.rpc('request_account_deletion', { p_reason: reason });
      if (error) throw error;
      return data;
    }
  });
}
