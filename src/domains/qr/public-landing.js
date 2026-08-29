import { supabase } from '../../infrastructure/supabase/client.js';

export async function getPublicQrLanding(code) {
  const normalized = String(code || '').trim();
  if (!normalized) throw new Error('A QR code is required.');
  const { data, error } = await supabase.rpc('get_public_qr_landing', { p_qr_code: normalized });
  if (error) throw error;
  if (!data) throw new Error('This QR code is unavailable.');
  return data;
}
