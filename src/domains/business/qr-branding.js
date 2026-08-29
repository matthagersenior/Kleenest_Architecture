import { supabase } from '../../infrastructure/supabase/client.js';

const ALLOWED_TYPES = new Set(['image/png','image/jpeg','image/webp','image/svg+xml']);
const MAX_BYTES = 2 * 1024 * 1024;

function extensionFor(file) {
  const raw = String(file?.name || '').split('.').pop()?.toLowerCase() || 'png';
  return raw === 'jpeg' ? 'jpg' : raw;
}

export async function uploadBusinessQrBrandingLogo({ businessId, file }) {
  if (!businessId) throw new Error('A business workspace is required.');
  if (!file) throw new Error('Choose a logo file to upload.');
  if (!ALLOWED_TYPES.has(file.type) || file.size > MAX_BYTES) {
    throw new Error('QR logos must be PNG, JPEG, WebP, or SVG and 2 MB or smaller.');
  }
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error('Sign in to continue.');
  const path = `${businessId}/${crypto.randomUUID()}.${extensionFor(file)}`;
  const bucket = supabase.storage.from('qr-branding');
  const { error: uploadError } = await bucket.upload(path, file, {
    upsert: true,
    contentType: file.type,
    cacheControl: '3600'
  });
  if (uploadError) throw uploadError;
  const publicUrl = bucket.getPublicUrl(path).data.publicUrl;
  return Object.freeze({ path, publicUrl, mimeType: file.type, sizeBytes: file.size });
}
