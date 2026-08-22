export function createActivityEventService(client) {
  if (!client) throw new Error('Supabase client is required.');

  async function record(eventType, {
    featureCode = null,
    subjectType = 'user',
    subjectId = null,
    locationId = null,
    businessId = null,
    valueNumeric = null,
    valueText = null,
    metadata = {}
  } = {}) {
    const { data: { user }, error: authError } = await client.auth.getUser();
    if (authError) throw authError;
    if (!user) return null;
    const { data, error } = await client.rpc('record_data_feature_event', {
      p_event_type: eventType,
      p_feature_code: featureCode,
      p_subject_type: subjectType,
      p_subject_id: subjectId || user.id,
      p_location_id: locationId,
      p_business_id: businessId,
      p_fleet_vehicle_id: null,
      p_source_table: 'client',
      p_source_id: null,
      p_value_numeric: valueNumeric,
      p_value_text: valueText,
      p_metadata: metadata
    });
    if (error) throw error;
    return data;
  }

  return Object.freeze({
    record,
    locationView: (locationId, metadata = {}) => record('location_view', {
      featureCode: 'location_view', subjectType: 'location', subjectId: locationId, locationId, metadata
    }),
    directionsRequested: (locationId, metadata = {}) => record('directions_requested', {
      featureCode: 'location_directions', subjectType: 'location', subjectId: locationId, locationId, metadata
    }),
    arrival: (locationId, metadata = {}) => record('arrival', {
      featureCode: 'location_arrival', subjectType: 'location', subjectId: locationId, locationId, metadata
    }),
    checkIn: (locationId, { checkInId = null, qrCodeId = null, pointsAwarded = 0 } = {}) => record('check_in', {
      featureCode: 'location_checkin', subjectType: 'location', subjectId: locationId,
      locationId, valueNumeric: pointsAwarded, metadata: { check_in_id: checkInId, qr_code_id: qrCodeId }
    }),
    reviewSubmitted: (locationId, { reviewId = null, rating = null } = {}) => record('review_submitted', {
      featureCode: 'location_review', subjectType: 'location', subjectId: locationId,
      locationId, valueNumeric: rating, metadata: { review_id: reviewId }
    }),
    favorite: (locationId, action = 'add') => record('favorite', {
      featureCode: 'favorite', subjectType: 'location', subjectId: locationId,
      locationId, metadata: { action }
    }),
    rewardEarned: (points = 0, reason = 'reward', metadata = {}) => record('reward_earned', {
      featureCode: 'rewards', valueNumeric: Number(points) || 0, valueText: String(reason),
      metadata: { ...metadata, points: Number(points) || 0, reason }
    })
  });
}
