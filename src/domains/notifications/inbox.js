export function createNotificationInboxService(client) {
  if (!client) throw new Error('Supabase client is required.');
  async function user() {
    const { data: { user }, error } = await client.auth.getUser();
    if (error) throw error;
    if (!user) throw new Error('Sign in to continue.');
    return user;
  }
  return Object.freeze({
    list: async (limit = 50) => {
      await user();
      const { data, error } = await client.rpc('user_notifications', { p_limit: Math.min(Math.max(Number(limit) || 50, 1), 100) });
      if (error) throw error;
      return data ?? [];
    },
    markRead: async (notificationId) => {
      await user();
      if (!notificationId) throw new Error('A notification is required.');
      const { data, error } = await client.rpc('mark_notification_read', { p_notification_id: notificationId });
      if (error) throw error;
      return data;
    },
    subscribe: async (userId, onChange) => {
      const me = await user();
      const id = userId ?? me.id;
      if (id !== me.id || typeof onChange !== 'function') return () => {};
      const channel = client.channel(`notifications:${id}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${id}` }, payload => onChange(payload.new)).subscribe();
      return () => client.removeChannel(channel);
    }
  });
}
