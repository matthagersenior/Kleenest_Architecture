export const MAX_OFFLINE_ATTEMPTS = 8;

export async function findAuthoritativeReplay(client, clientEventId) {
  if (!clientEventId) return null;
  const { data, error } = await client
    .from('offline_pack_events')
    .select('id, client_event_id, synced_at, metadata')
    .eq('client_event_id', clientEventId)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

export function shouldAttemptReplay(event) {
  return !event?.synced_at && Number(event?.attempt_count || 0) < MAX_OFFLINE_ATTEMPTS;
}
