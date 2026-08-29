import { supabase } from '../../infrastructure/supabase/client.js';

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function validateFile(file) {
  if (!file) throw new Error('Photo file is required');
  if (!ALLOWED_TYPES.has(file.type)) throw new Error('Unsupported photo type');
  if (file.size > MAX_BYTES) throw new Error('Photo exceeds 10 MB limit');
}

export async function uploadEvidencePhoto({ file, userId, checkInId, locationId }) {
  validateFile(file);
  if (!userId || !checkInId || !locationId) throw new Error('Photo evidence requires user, check-in, and location');
  if (!supabase) throw new Error('Supabase is not configured.');
  const extension = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1];
  const path = `${userId}/evidence/${checkInId}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage.from('location-photos').upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) throw uploadError;
  const { data, error } = await supabase.rpc('submit_location_photo_record', { p_location_id: locationId, p_storage_path: path, p_media_type: file.type, p_file_size_bytes: file.size, p_check_in_id: checkInId });
  if (error) {
    await supabase.storage.from('location-photos').remove([path]);
    throw error;
  }
  return data;
}

export function createConsumerPhotoService(client = supabase) {
  return Object.freeze({ uploadEvidencePhoto: args => {
    if (client === supabase) return uploadEvidencePhoto(args);
    return uploadWithClient(client, args);
  }});
}

async function uploadWithClient(client, { file, userId, checkInId, locationId }) {
  validateFile(file);
  if (!userId || !checkInId || !locationId) throw new Error('Photo evidence requires user, check-in, and location');
  const extension = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1];
  const path = `${userId}/evidence/${checkInId}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await client.storage.from('location-photos').upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) throw uploadError;
  const { data, error } = await client.rpc('submit_location_photo_record', { p_location_id: locationId, p_storage_path: path, p_media_type: file.type, p_file_size_bytes: file.size, p_check_in_id: checkInId });
  if (error) {
    await client.storage.from('location-photos').remove([path]);
    throw error;
  }
  return data;
}
