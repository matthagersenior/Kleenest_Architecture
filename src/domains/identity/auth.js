const normalizeBase=value=>String(value||'').trim().replace(/\/+$/,'');
const normalizePath=value=>`/${String(value||'/').replace(/^\/+/, '')}`;

export function createIdentityService(client, { appUrl = path => path } = {}) {
  if (!client) throw new Error('Supabase client is required.');
  const configuredPublicBase=normalizeBase(import.meta.env.VITE_PUBLIC_APP_URL);
  const redirectUrl=path=>configuredPublicBase?`${configuredPublicBase}${normalizePath(path)}`:appUrl(path);
  const oauth = provider => client.auth.signInWithOAuth({ provider, options: { redirectTo: redirectUrl('/') } });
  const emailRedirect = () => redirectUrl('/profile');
  return Object.freeze({
    getCurrentUser: async () => { const { data, error } = await client.auth.getUser(); if (error) throw error; return data.user ?? null; },
    signUp: ({ email, password, fullName = '' }) => client.auth.signUp({ email, password, options: { data: { full_name: fullName }, emailRedirectTo: emailRedirect() } }),
    signIn: ({ email, password }) => client.auth.signInWithPassword({ email, password }),
    signInWithMagicLink: email => client.auth.signInWithOtp({ email, options: { emailRedirectTo: emailRedirect(), shouldCreateUser: false } }),
    signInWithGoogle: () => oauth('google'),
    signInWithApple: () => oauth('apple'),
    signInWithMicrosoft: () => oauth('azure'),
    signInWithOAuth: provider => oauth(provider),
    signOut: () => client.auth.signOut({ scope: 'local' }),
    sendPasswordReset: email => client.auth.resetPasswordForEmail(email, { redirectTo: emailRedirect() }),
    updatePassword: password => { if (!password || password.length < 8) throw new Error('Password must be at least 8 characters.'); return client.auth.updateUser({ password }); },
    updateUserMetadata: data => client.auth.updateUser({ data })
  });
}
