export function createIdentityService(client, { appUrl = path => path } = {}) {
  if (!client) throw new Error('Supabase client is required.');
  const oauth = provider => client.auth.signInWithOAuth({ provider, options: { redirectTo: appUrl('/') } });
  return Object.freeze({
    getCurrentUser: async () => { const { data, error } = await client.auth.getUser(); if (error) throw error; return data.user ?? null; },
    signUp: ({ email, password, fullName = '' }) => client.auth.signUp({ email, password, options: { data: { full_name: fullName }, emailRedirectTo: appUrl('/profile') } }),
    signIn: ({ email, password }) => client.auth.signInWithPassword({ email, password }),
    signInWithGoogle: () => oauth('google'),
    signInWithApple: () => oauth('apple'),
    signInWithMicrosoft: () => oauth('azure'),
    signInWithOAuth: provider => oauth(provider),
    signOut: () => client.auth.signOut({ scope: 'local' }),
    sendPasswordReset: email => client.auth.resetPasswordForEmail(email, { redirectTo: appUrl('/profile') }),
    updatePassword: password => { if (!password || password.length < 8) throw new Error('Password must be at least 8 characters.'); return client.auth.updateUser({ password }); },
    updateUserMetadata: data => client.auth.updateUser({ data })
  });
}
