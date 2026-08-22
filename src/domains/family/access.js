export function createFamilyService(client) {
  if (!client) throw new Error('Supabase client is required.');
  async function user() { const { data: { user }, error } = await client.auth.getUser(); if (error) throw error; if (!user) throw new Error('Sign in to continue.'); return user; }
  const createGroup = async name => { await user(); if (!String(name ?? '').trim()) throw new Error('Family name is required.'); const { data, error } = await client.rpc('create_family_group', { p_name: String(name).trim() }); if (error) throw error; return data; };
  const inviteMember = async email => { await user(); const { data, error } = await client.rpc('invite_family_member', { p_email: String(email ?? '').trim() }); if (error) throw error; return data; };
  return Object.freeze({
    createGroup,
    create: createGroup,
    inviteMember,
    invite: inviteMember,
    acceptInvite: async () => { await user(); const { data, error } = await client.rpc('accept_family_invite'); if (error) throw error; return data; },
    hasPremiumAccess: async (userId = null) => { const me = await user(); const { data, error } = await client.rpc('family_has_premium_access', { p_user_id: userId ?? me.id }); if (error) throw error; return Boolean(data); }
  });
}
