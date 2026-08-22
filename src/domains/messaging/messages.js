export function createMessagingService(client) {
  if (!client) throw new Error('Supabase client is required.');

  async function user() {
    const { data: { user }, error } = await client.auth.getUser();
    if (error) throw error;
    if (!user) throw new Error('Sign in to continue.');
    return user;
  }

  return Object.freeze({
    listConversation: async (otherUserId, limit = 100) => {
      const me = await user();
      const { data, error } = await client.from('messages')
        .select('id,from_id,to_id,content,status,created_at,read_at')
        .or(`and(from_id.eq.${me.id},to_id.eq.${otherUserId}),and(from_id.eq.${otherUserId},to_id.eq.${me.id})`)
        .order('created_at', { ascending: true })
        .limit(Number(limit));
      if (error) throw error;
      return data ?? [];
    },

    send: async (toUserId, content) => {
      const me = await user();
      if (!toUserId || toUserId === me.id) throw new Error('A different recipient is required.');
      const body = String(content ?? '').trim();
      if (!body) throw new Error('Message content is required.');
      const { data, error } = await client.from('messages')
        .insert({ from_id: me.id, to_id: toUserId, content: body, status: 'sent' })
        .select('id,from_id,to_id,content,status,created_at,read_at')
        .single();
      if (error) throw error;
      return data;
    },

    markRead: async (messageId) => {
      const me = await user();
      const { data, error } = await client.from('messages')
        .update({ read_at: new Date().toISOString(), status: 'read' })
        .eq('id', messageId)
        .eq('to_id', me.id)
        .select('id,from_id,to_id,content,status,created_at,read_at')
        .single();
      if (error) throw error;
      return data;
    }
  });
}
