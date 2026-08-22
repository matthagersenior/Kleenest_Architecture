export function createSupportService(client) {
  if (!client) throw new Error('Supabase client is required.');
  async function user() {
    const { data: { user }, error } = await client.auth.getUser();
    if (error) throw error;
    if (!user) throw new Error('Sign in to continue.');
    return user;
  }
  return Object.freeze({
    create: async ({ subject, message, category = 'general' }) => {
      const me = await user();
      if (!String(subject ?? '').trim() || !String(message ?? '').trim()) throw new Error('Subject and message are required.');
      const { data, error } = await client.from('support_requests').insert({ user_id: me.id, subject: String(subject).trim(), message: String(message).trim(), category }).select().single();
      if (error) throw error;
      return data;
    },
    listMine: async () => {
      const me = await user();
      const { data, error } = await client.from('support_requests').select('*').eq('user_id', me.id).order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    feedback: async ({ type = 'general', title, description, page = null, appVersion = null, browser = null, metadata = {} }) => {
      const me = await user();
      const { data, error } = await client.from('user_feedback').insert({ user_id: me.id, type, title: String(title ?? '').trim(), description: String(description ?? '').trim(), page, app_version: appVersion, browser, metadata }).select().single();
      if (error) throw error;
      return data;
    },
    requestAccountDeletion: async (reason = null) => {
      await user();
      const { data, error } = await client.rpc('request_account_deletion', { p_reason: reason });
      if (error) throw error;
      return data;
    }
  });
}
