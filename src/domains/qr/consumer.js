export function createConsumerQrService(client) {
  if (!client) throw new Error('Supabase client is required.');

  async function requireUser() {
    const { data: { user }, error } = await client.auth.getUser();
    if (error) throw error;
    if (!user) throw new Error('Sign in to continue.');
    return user;
  }

  return Object.freeze({
    consumeSingleUse: async (code) => {
      const user = await requireUser();
      if (!code) throw new Error('QR code is required.');
      const { data, error } = await client.rpc('consume_single_use_qr', { p_code: code, p_user_id: user.id });
      if (error) throw error;
      return data;
    },

    redeem: async (code) => {
      await requireUser();
      if (!code) throw new Error('QR code is required.');
      const { data, error } = await client.rpc('redeem_qr_code', { p_code: code });
      if (error) throw error;
      return data;
    }
  });
}
