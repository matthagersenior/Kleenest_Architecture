export function createFollowService(client) {
  if (!client) throw new Error('Supabase client is required.');
  async function user() {
    const { data: { user }, error } = await client.auth.getUser();
    if (error) throw error;
    if (!user) throw new Error('Sign in to continue.');
    return user;
  }
  const rpc = async (name, args = {}) => {
    const { data, error } = await client.rpc(name, args);
    if (error) throw error;
    return data;
  };
  return Object.freeze({
    follow: async (targetUserId) => {
      const me = await user();
      if (!targetUserId || targetUserId === me.id) throw new Error('A different user is required.');
      return rpc('follow_user', { p_user_id: targetUserId });
    },
    unfollow: async (targetUserId) => {
      const me = await user();
      if (!targetUserId || targetUserId === me.id) throw new Error('A different user is required.');
      return rpc('unfollow_user', { p_target_user_id: targetUserId });
    },
    toggle: async (targetUserId) => {
      const me = await user();
      if (!targetUserId || targetUserId === me.id) throw new Error('A different user is required.');
      const following = Boolean(await rpc('is_following_user', { p_target_user_id: targetUserId }));
      if (following) {
        await rpc('unfollow_user', { p_target_user_id: targetUserId });
        return { following: false, following_id: targetUserId };
      }
      const result = await rpc('follow_user', { p_user_id: targetUserId });
      return { ...(result || {}), following: true, following_id: targetUserId };
    },
    listFollowing: async (limit = 100) => {
      await user();
      return (await rpc('list_following_users', { p_limit: limit })) ?? [];
    },
    listFollowers: async (limit = 100) => {
      await user();
      return (await rpc('list_follower_users', { p_limit: limit })) ?? [];
    },
    isFollowing: async (targetUserId) => {
      await user();
      if (!targetUserId) return false;
      return Boolean(await rpc('is_following_user', { p_target_user_id: targetUserId }));
    }
  });
}
