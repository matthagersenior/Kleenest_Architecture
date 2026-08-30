import { normalizePlace } from './place.js';

function asObject(value) {
  if (!value) return null;
  if (Array.isArray(value)) return value[0] || null;
  return value;
}

function normalizeAuthorityBundle(bundle) {
  const root = asObject(bundle) || {};
  const location = asObject(root.location);
  const place = asObject(root.place);
  const intelligence = asObject(root.intelligence) || {};
  const trust = asObject(root.trust);
  const externalRecords = Array.isArray(root.external_records) ? root.external_records : [];
  const latestExternal = externalRecords[0] || null;
  const rawExternal = latestExternal?.raw_data ?? latestExternal?.rawData ?? null;
  const rawTags = rawExternal?.osm_tags ?? rawExternal?.tags ?? rawExternal?.source_metadata?.tags ?? latestExternal?.tags ?? latestExternal?.osm_tags ?? location?.source_metadata?.tags ?? null;
  const interaction = asObject(root.interaction) || {};

  if (!location && !place) return null;

  const normalizedTrust = trust ? {
    score: trust.trust_score ?? trust.score ?? trust.confidence_score ?? null,
    confidence: trust.confidence_level ?? trust.level ?? null,
    freshness: trust.freshness_score ?? null,
    staleness: trust.staleness_status ?? null,
    lastVerifiedAt: trust.last_verified_at ?? null,
    reverificationDueAt: trust.reverification_due_at ?? null,
    verificationCount: trust.verification_count ?? 0,
    evidenceCount: trust.evidence_count ?? trust.review_count ?? 0,
  } : null;

  const sourceProjection = {
    source: location?.source ?? rawExternal?.source ?? latestExternal?.source ?? latestExternal?.source_system ?? null,
    source_dataset: location?.source_dataset ?? rawExternal?.source_dataset ?? latestExternal?.source_dataset ?? null,
    external_location_id: latestExternal?.external_location_id ?? latestExternal?.external_id ?? latestExternal?.osm_id ?? null,
    external_record_id: latestExternal?.id ?? null,
    external_records: externalRecords,
    raw_data: rawExternal,
    raw_tags: rawTags,
    osm_tags: rawTags,
    source_metadata: location?.source_metadata ?? rawExternal?.source_metadata ?? null,
    source_provenance: latestExternal ? {
      source: rawExternal?.source ?? latestExternal.source ?? latestExternal.source_system ?? null,
      dataset: rawExternal?.source_dataset ?? latestExternal.source_dataset ?? null,
      external_id: latestExternal.external_location_id ?? latestExternal.external_id ?? latestExternal.osm_id ?? null,
      captured_at: rawExternal?.source_metadata?.captured_at ?? latestExternal.last_seen_at ?? latestExternal.source_updated_at ?? latestExternal.captured_at ?? latestExternal.ingested_at ?? latestExternal.created_at ?? null,
    } : null,
  };

  return normalizePlace({
    ...(place || {}),
    ...(location || {}),
    ...intelligence,
    ...sourceProjection,
    id: location?.id ?? place?.id,
    location_id: location?.id ?? place?.location_id ?? place?.id,
    intelligence_freshness_label: intelligence?.freshness_label ?? null,
    review_count: place?.review_count ?? intelligence?.reviews_30d ?? 0,
    trust: normalizedTrust,
    trust_score: normalizedTrust?.score ?? null,
    trust_freshness_score: normalizedTrust?.freshness ?? null,
    trust_staleness_status: normalizedTrust?.staleness ?? null,
    trust_last_verified_at: normalizedTrust?.lastVerifiedAt ?? null,
    trust_reverification_due_at: normalizedTrust?.reverificationDueAt ?? null,
    interaction_state: {
      favorited: Boolean(interaction.favorited),
      checkedIn: Boolean(interaction.checked_in),
      latestCheckIn: interaction.latest_check_in ?? null,
    },
  });
}

export function createLocationDetailsService(client, { offline = null } = {}) {
  if (!client) throw new Error('Supabase client is required.');

  async function requireUser() {
    const { data: { user }, error } = await client.auth.getUser();
    if (error) throw error;
    if (!user) throw new Error('Sign in to continue.');
    return user;
  }

  async function recordReadTelemetry(locationId, metadata = {}) {
    if (!locationId) return;
    try {
      const { data: { user } } = await client.auth.getUser();
      if (!user) return;
      await client.rpc('record_data_feature_event', {
        p_event_type: 'location_authority_read',
        p_feature_code: 'location_authority_read',
        p_subject_type: 'location',
        p_subject_id: locationId,
        p_location_id: locationId,
        p_business_id: null,
        p_fleet_vehicle_id: null,
        p_source_table: 'location_details_service',
        p_source_id: null,
        p_value_numeric: null,
        p_value_text: metadata.source ?? null,
        p_metadata: metadata,
      });
    } catch {}
  }

  async function cachedById(placeId) {
    if (!offline?.cachedLocations || !offline?.cachedBusinesses) return null;
    try {
      const [locations, businesses] = await Promise.all([offline.cachedLocations(), offline.cachedBusinesses()]);
      const location = (locations || []).find(row => String(row.location_id ?? row.snapshot?.location_id ?? row.id) === String(placeId) || String(row.snapshot?.id) === String(placeId));
      if (location) return normalizePlace({ ...(location.snapshot || {}), ...location, id: location.snapshot?.id ?? location.id, location_id: location.location_id ?? location.snapshot?.location_id ?? location.id, source: location.source ?? location.snapshot?.source ?? 'offline_cache', source_dataset: location.source_dataset ?? location.snapshot?.source_dataset ?? 'kleenest_offline_pack' });
      const business = (businesses || []).find(row => String(row.business_id ?? row.snapshot?.business_id ?? row.id) === String(placeId) || String(row.snapshot?.id) === String(placeId));
      if (business) return normalizePlace({ ...(business.snapshot || {}), ...business, id: business.snapshot?.id ?? business.id, location_id: business.snapshot?.location_id ?? business.location_id ?? business.id, source: business.source ?? business.snapshot?.source ?? 'offline_cache', source_dataset: business.source_dataset ?? business.snapshot?.source_dataset ?? 'kleenest_offline_pack' });
    } catch {}
    return null;
  }

  async function fetchAuthorityBundle(locationId) {
    const { data, error } = await client.rpc('get_location_authority_bundle', { p_location_id: locationId });
    if (error) throw error;
    return asObject(data) || {};
  }

  async function getById(placeId) {
    if (!placeId) throw new Error('Place is required.');
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      const cached = await cachedById(placeId);
      await recordReadTelemetry(placeId, { source: 'offline_cache', online: false, fallback: true, found: Boolean(cached) });
      return cached;
    }

    try {
      const bundle = await fetchAuthorityBundle(placeId);
      const place = normalizeAuthorityBundle(bundle);
      if (place) {
        await recordReadTelemetry(placeId, { source: 'authority_bundle', online: true, fallback: false, schema_version: bundle.schema_version ?? 1 });
        return place;
      }
      const cached = await cachedById(placeId);
      await recordReadTelemetry(placeId, { source: 'offline_cache', online: true, fallback: true, reason: 'authority_bundle_empty', found: Boolean(cached) });
      return cached;
    } catch (error) {
      const cached = await cachedById(placeId);
      await recordReadTelemetry(placeId, { source: 'offline_cache', online: true, fallback: true, reason: 'authority_bundle_error', error_code: error?.code ?? null, found: Boolean(cached) });
      if (cached) return cached;
      throw error;
    }
  }

  async function reviews(locationId, limit = 30) {
    if (!locationId) return [];
    const bundle = await fetchAuthorityBundle(locationId);
    return (Array.isArray(bundle.reviews) ? bundle.reviews : [])
      .slice(0, Math.min(Math.max(Number(limit) || 30, 1), 100))
      .map(item => {
        const row = asObject(item?.review) || asObject(item) || {};
        const profile = asObject(item?.profile);
        const reputation = asObject(item?.reputation);
        return { ...row, ...(profile ? { profiles: profile } : {}), rating: row.stars, body: row.comment, photos: Array.isArray(item?.photos) ? item.photos : [], verified: Boolean(row.check_in_id), reputation: reputation || null };
      });
  }

  async function interactionState(locationId) {
    await requireUser();
    const bundle = await fetchAuthorityBundle(locationId);
    const interaction = asObject(bundle.interaction) || {};
    return { favorited: Boolean(interaction.favorited), checkedIn: Boolean(interaction.checked_in), latestCheckIn: interaction.latest_check_in || null };
  }

  async function trustState(locationId) {
    if (!locationId) return null;
    try {
      const bundle = await fetchAuthorityBundle(locationId);
      return asObject(bundle.trust) || null;
    } catch { return null; }
  }

  async function recordView(locationId, metadata = {}) {
    if (!locationId) return null;
    const { data: { user } } = await client.auth.getUser();
    if (!user) return null;
    return client.rpc('record_data_feature_event', {
      p_event_type: 'location_view', p_feature_code: 'location_view', p_subject_type: 'location', p_subject_id: locationId,
      p_location_id: locationId, p_business_id: null, p_fleet_vehicle_id: null, p_source_table: 'client', p_source_id: null,
      p_value_numeric: null, p_value_text: null, p_metadata: metadata,
    }).then(({ data, error }) => { if (error) throw error; return data; });
  }

  return Object.freeze({ getById, reviews, interactionState, recordView, trustState });
}