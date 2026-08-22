export function createFollowService(client) {
  if (!client) throw new Error('Supabase client is required.');
  async function user() {
    const { data: { user }, error } = await client.auth.getUser();
    if (error) throw error;
    if (!user) throw new Error('Sign in to continue.');
    return user;
  }
  return Object.freeze({
    follow: async (targetUserId) => {
      const me = await user();
      if (!targetUserId || targetUserId === me.id) throw new Error('A different user is required.');
      const { data, error } = await client.rpc('follow_user', { p_user_id: targetUserId });
      if (error) throw error;
      return data;
    },
    unfollow: async (targetUserId) => {
      const me = await user();
      const { error } = await client.from('follows').delete().eq('follower_id', me.id).eq('following_id', targetUserId);
      if (error) throw error;
    },
    listFollowing: async () => {
      const me = await user();
      const { data, error } = await client.from('follows').select('following_id,created_at').eq('follower_id', me.id).order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    isFollowing: async (targetUserId) => {
      const me = await user();
      if (!targetUserId) return false;
      const { data, error } = await client.from('follows').select('follower_id').eq('follower_id', me.id).eq('following_id', targetUserId).maybeSingle();
      if (error) throw error;
      return Boolean(data);
    }
  });
}
