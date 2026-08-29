import { normalizePlace } from './place.js';

export function createLocationDetailsService(client, { offline = null } = {}) {
  if (!client) throw new Error('Supabase client is required.');

  async function requireUser() {
    const { data: { user }, error } = await client.auth.getUser();
    if (error) throw error;
    if (!user) throw new Error('Sign in to continue.');
    return user;
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

  async function getById(placeId) {
    if (!placeId) throw new Error('Place is required.');
    const offlineNow = typeof navigator !== 'undefined' && navigator.onLine === false;
    if (offlineNow) return cachedById(placeId);

    // Accept either the canonical location UUID or a place UUID at the public
    // boundary. Internally, all downstream consumers receive location_id.
    const requestedId = String(placeId);
    const { data: placeById, error: placeError } = await client.from('places')
      .select('id,name,category,description,address,city,state,postal_code,latitude,longitude,rating,review_count,is_verified,location_id,created_at,updated_at')
      .eq('id', requestedId).eq('is_active', true).maybeSingle();
    if (placeError) throw placeError;

    let place = placeById;
    let locationId = place?.location_id ?? null;
    if (!place) {
      const { data: locationRow, error: locationLookupError } = await client.from('locations')
        .select('id,name,place_type,address,city,state,postal_code,latitude,longitude,source,source_dataset,cleanliness,cleanliness_pct,accessible,changing_table,smart_bathroom,bathroom_verification_status,bathroom_verification_count,bathroom_positive_count,bathroom_negative_count,verification_confidence,updated_at,created_at')
        .eq('id', requestedId).eq('is_active', true).maybeSingle();
      if (locationLookupError) throw locationLookupError;
      if (!locationRow) return cachedById(placeId);
      locationId = locationRow.id;
      place = {
        id: locationRow.id,
        name: locationRow.name,
        category: locationRow.place_type,
        address: locationRow.address,
        city: locationRow.city,
        state: locationRow.state,
        postal_code: locationRow.postal_code,
        latitude: locationRow.latitude,
        longitude: locationRow.longitude,
        location_id: locationRow.id,
        source: locationRow.source,
        source_dataset: locationRow.source_dataset,
        cleanliness: locationRow.cleanliness,
        cleanliness_pct: locationRow.cleanliness_pct,
        accessible: locationRow.accessible,
        changing_table: locationRow.changing_table,
        smart_bathroom: locationRow.smart_bathroom,
        bathroom_verification_status: locationRow.bathroom_verification_status,
        bathroom_verification_count: locationRow.bathroom_verification_count,
        bathroom_positive_count: locationRow.bathroom_positive_count,
        bathroom_negative_count: locationRow.bathroom_negative_count,
        verification_confidence: locationRow.verification_confidence,
        updated_at: locationRow.updated_at,
        created_at: locationRow.created_at,
        is_verified: false
      };
    }

    let location = null;
    if (locationId) {
      const { data, error: locationError } = await client.from('locations')
        .select('id,cleanliness,cleanliness_pct,accessible,changing_table,smart_bathroom,bathroom_verification_status,bathroom_verification_count,bathroom_positive_count,bathroom_negative_count,verification_confidence,source,source_dataset,updated_at,created_at')
        .eq('id', locationId).maybeSingle();
      if (locationError) throw locationError;
      location = data;
    }

    let intelligence = null;
    const { data: intelligenceRows, error: intelligenceError } = await client.from('location_intelligence_snapshot')
      .select('location_id,place_id,intelligence_score,cleanliness_pct,verification_count,observation_count,reviews_30d,searches_7d,searches_30d,views_30d,directions_30d,arrivals_30d,checkins_30d,last_observed_at,calculated_at,freshness_label')
      .eq(locationId ? 'location_id' : 'place_id', locationId || place.id).limit(1);
    if (!intelligenceError) intelligence = intelligenceRows?.[0] || null;

    return normalizePlace({
      ...place,
      ...(location || {}),
      ...(intelligence || {}),
      location_id: locationId || place.location_id || place.id,
      intelligence_freshness_label: intelligence?.freshness_label ?? null,
      review_count: place.review_count ?? intelligence?.reviews_30d ?? 0
    });
  }

  async function reviews(locationId, limit = 30) {
    if (!locationId) return [];
    // Keep the primary review query independent from review_photos RLS. A denied
    // photo relation must never make otherwise-public reviews disappear.
    const { data, error } = await client.from('reviews')
      .select('id,location_id,user_id,check_in_id,stars,cleanliness_pct,comment,status,business_reply,business_replied_at,created_at,profiles:user_id(display_name,avatar_url)')
      .eq('location_id', locationId).order('created_at', { ascending: false }).limit(Math.min(Math.max(Number(limit) || 30, 1), 100));
    if (error) throw error;
    const rows = data || [];
    const userIds = [...new Set(rows.map(row => row.user_id).filter(Boolean))];
    let reputationByUser = new Map();
    if (userIds.length) {
      const { data: reputationRows, error: reputationError } = await client.from('contributor_reputation').select('user_id,reputation_score,verification_level,verified_checkins_count,confirmed_observations_count').in('user_id', userIds);
      if (!reputationError) reputationByUser = new Map((reputationRows || []).map(row => [row.user_id, row]));
    }
    let photosByReview = new Map();
    try {
      const reviewIds = rows.map(row => row.id).filter(Boolean);
      if (reviewIds.length) {
        const { data: photoRows, error: photoError } = await client.from('review_photos').select('id,review_id,storage_path,mime_type,width,height,sort_order').in('review_id', reviewIds).order('sort_order', { ascending: true });
        if (!photoError) for (const photo of photoRows || []) {
          const list = photosByReview.get(photo.review_id) || [];
          list.push(photo);
          photosByReview.set(photo.review_id, list);
        }
      }
    } catch {}
    return rows.map(row => ({ ...row, rating: row.stars, body: row.comment, photos: photosByReview.get(row.id) || [], verified: Boolean(row.check_in_id), reputation: reputationByUser.get(row.user_id) || null }));
  }

  async function interactionState(locationId) {
    const user = await requireUser();
    if (!locationId) throw new Error('Canonical location is required.');
    const [favoriteResult, checkInResult] = await Promise.all([
      client.from('favorites').select('location_id').eq('user_id', user.id).eq('location_id', locationId).maybeSingle(),
      client.from('check_ins').select('id,checked_in_at,points_awarded').eq('user_id', user.id).eq('location_id', locationId).order('checked_in_at', { ascending: false }).limit(1).maybeSingle()
    ]);
    if (favoriteResult.error) throw favoriteResult.error;
    if (checkInResult.error) throw checkInResult.error;
    return { favorited: Boolean(favoriteResult.data), checkedIn: Boolean(checkInResult.data), latestCheckIn: checkInResult.data || null };
  }

  async function recordView(locationId, metadata = {}) {
    if (!locationId) return null;
    const { data: { user } } = await client.auth.getUser();
    if (!user) return null;
    return client.rpc('record_data_feature_event', { p_event_type: 'location_view', p_feature_code: 'location_view', p_subject_type: 'location', p_subject_id: locationId, p_location_id: locationId, p_business_id: null, p_fleet_vehicle_id: null, p_source_table: 'client', p_source_id: null, p_value_numeric: null, p_value_text: null, p_metadata: metadata }).then(({ data, error }) => { if (error) throw error; return data; });
  }

  return Object.freeze({ getById, reviews, interactionState, recordView });
}
