export async function process_intelligence_notification_jobs(client, limit = 25) {
  if (!client) throw new Error('Supabase client is required.');
  const { data, error } = await client.rpc('process_intelligence_notification_jobs', { p_limit: limit });
  if (error) throw error;
  return data ?? 0;
}

export function createIntelligenceNotificationService(client) {
  if (!client) throw new Error('Supabase client is required.');

  return Object.freeze({
    createCandidate: async ({ locationId, surface, type, dedupeKey, title, body, reasons = [], signals = {}, generatedAt = null, cooldownMinutes = 120 }) => {
      const { data: { user }, error: authError } = await client.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('Sign in to continue.');
      if (!locationId || !surface || !type || !dedupeKey || !title || !body) {
        throw new Error('Invalid intelligence notification candidate.');
      }
      const { data, error } = await client.rpc('create_intelligence_notification', {
        p_user_id: user.id,
        p_location_id: locationId,
        p_surface: surface,
        p_type: type,
        p_dedupe_key: dedupeKey,
        p_title: title,
        p_body: body,
        p_data: {
          reasons,
          signals,
          generated_at: generatedAt ?? new Date().toISOString()
        },
        p_cooldown_minutes: cooldownMinutes
      });
      if (error) throw error;
      return data;
    },
    processJobs: async (limit = 25) => process_intelligence_notification_jobs(client, limit)
  });
}
