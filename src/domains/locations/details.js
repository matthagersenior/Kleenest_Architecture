import { normalizePlace } from './place.js';

export function createLocationDetailsService(client) {
  if (!client) throw new Error('Supabase client is required.');

  async function requireUser() {
    const { data: { user }, error } = await client.auth.getUser();
    if (error) throw error;
    if (!user) throw new Error('Sign in to continue.');
    return user;
  }

  async function getById(placeId) {
    if (!placeId) throw new Error('Place is required.');
    const { data: place, error } = await client.from('places')
      .select('id,name,category,description,address,city,state,postal_code,latitude,longitude,rating,review_count,is_verified,location_id,created_at,updated_at')
      .eq('id', placeId)
      .eq('is_active', true)
      .maybeSingle();
    if (error) throw error;
    if (!place) return null;

    let location = null;
    if (place.location_id) {
      const { data, error: locationError } = await client.from('locations')
        .select('id,cleanliness,cleanliness_pct,accessible,changing_table,smart_bathroom,bathroom_verification_status,bathroom_verification_count,bathroom_positive_count,bathroom_negative_count,source,source_dataset,updated_at,created_at')
        .eq('id', place.location_id)
        .maybeSingle();
      if (locationError) throw locationError;
      location = data;
    }

    let intelligence = null;
    const { data: intelligenceRows, error: intelligenceError } = await client.from('location_intelligence_snapshot')
      .select('location_id,place_id,intelligence_score,cleanliness_pct,verification_count,observation_count,reviews_30d,searches_7d,searches_30d,views_30d,directions_30d,arrivals_30d,checkins_30d,last_observed_at,calculated_at,freshness_label')
      .eq('place_id', place.id)
      .limit(1);
    if (!intelligenceError) intelligence = intelligenceRows?.[0] || null;

    return normalizePlace({
      ...place,
      ...(location || {}),
      ...(intelligence || {}),
      intelligence_freshness_label: intelligence?.freshness_label ?? null,
      review_count: place.review_count ?? intelligence?.reviews_30d ?? 0
    });
  }

  async function reviews(locationId, limit = 30) {
    if (!locationId) return [];
    const { data, error } = await client.from('reviews')
      .select('id,location_id,user_id,check_in_id,stars,cleanliness_pct,comment,status,business_reply,business_replied_at,created_at,profiles:user_id(display_name,avatar_url),review_photos(id,storage_path,mime_type,width,height,sort_order)')
      .eq('location_id', locationId)
      .order('created_at', { ascending: false })
      .limit(Math.min(Math.max(Number(limit) || 30, 1), 100));
    if (error) throw error;
    return (data || []).map(row => ({ ...row, rating: row.stars, body: row.comment, photos: row.review_photos || [] }));
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
    return client.rpc('record_data_feature_event', {
      p_event_type: 'location_view', p_feature_code: 'location_view', p_subject_type: 'location',
      p_subject_id: locationId, p_location_id: locationId, p_business_id: null, p_fleet_vehicle_id: null,
      p_source_table: 'client', p_source_id: null, p_value_numeric: null, p_value_text: null, p_metadata: metadata
    }).then(({ data, error }) => { if (error) throw error; return data; });
  }

  return Object.freeze({ getById, reviews, interactionState, recordView });
}
