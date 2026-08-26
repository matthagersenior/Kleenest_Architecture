import type { SupabaseClient } from '@supabase/supabase-js';

export function createMobileIdentityService(client: SupabaseClient) {
  return Object.freeze({
    getCurrentUser: async () => {
      const { data, error } = await client.auth.getUser();
      if (error) throw error;
      return data.user ?? null;
    },
    signIn: ({ email, password }: { email: string; password: string }) => client.auth.signInWithPassword({ email, password }),
    signUp: ({ email, password, fullName = '' }: { email: string; password: string; fullName?: string }) => client.auth.signUp({ email, password, options: { data: { full_name: fullName } } }),
    signOut: () => client.auth.signOut({ scope: 'local' }),
    sendPasswordReset: (email: string) => client.auth.resetPasswordForEmail(email),
    updatePassword: (password: string) => {
      if (password.length < 8) throw new Error('Password must be at least 8 characters.');
      return client.auth.updateUser({ password });
    },
  });
}
