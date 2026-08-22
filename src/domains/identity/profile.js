const PROFILE_FIELDS = [
  'id', 'display_name', 'username', 'avatar_url', 'bio', 'role',
  'subscription_tier', 'points', 'level', 'streak', 'total_check_ins',
  'total_reviews', 'is_business_user', 'is_admin', 'created_at'
];

export function createProfileService(client) {
  if (!client) throw new Error('Supabase client is required.');
  const projection = PROFILE_FIELDS.join(',');

  return Object.freeze({
    get: async userId => {
      if (!userId) return null;
      const { data, error } = await client.from('profiles')
        .select(projection)
        .eq('id', userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    }
  });
}

export { PROFILE_FIELDS };
