export function createLocationEvidenceService(client) {
  if (!client) throw new Error('Supabase client is required.');
  const rpc = async (name, params) => { const { data, error } = await client.rpc(name, params); if (error) throw error; return data; };
  const booleanValue = value => value === true || value === 'true' || value === '1' || value === 1;
  const numberOrNull = value => value == null || value === '' ? null : Number(value);
  return Object.freeze({
    restroomObservation: values => rpc('submit_restroom_observation', { p_location_id: values.locationId, p_check_in_id: values.checkInId || null, p_observation_type: values.observationType, p_cleanliness_pct: numberOrNull(values.cleanlinessPct), p_note: values.note || null }),
    amenityObservation: values => rpc('submit_amenity_observation', { p_location_id: values.locationId, p_amenity_id: values.amenityId, p_status: values.status, p_confidence: numberOrNull(values.confidence), p_verification_method: values.verificationMethod || null, p_check_in_id: values.checkInId || null, p_photo_id: values.photoId || null, p_notes: values.notes || null, p_metadata: values.metadata || {} }),
    qualityObservation: values => rpc('submit_location_quality_observation', { p_location_id: values.locationId, p_stars: Number(values.stars), p_cleanliness: numberOrNull(values.cleanliness), p_accessibility: numberOrNull(values.accessibility), p_safety: numberOrNull(values.safety), p_availability: numberOrNull(values.availability), p_condition: numberOrNull(values.condition), p_feedback: values.feedback || null, p_check_in_id: values.checkInId || null, p_photo_id: values.photoId || null, p_metadata: values.metadata || {} }),
    verification: values => rpc('submit_location_verification', { p_location_id: values.locationId, p_is_open: booleanValue(values.isOpen), p_has_bathroom: booleanValue(values.hasBathroom), p_note: values.note || null }),
    trustedBathroomVerification: values => rpc('record_bathroom_verification', { p_location_id: values.locationId, p_has_public_bathroom: booleanValue(values.hasPublicBathroom), p_lat: Number(values.latitude), p_lng: Number(values.longitude), p_distance_meters: Number(values.distanceMeters || 0) }),
    bathroomStatus: locationId => rpc('get_location_bathroom_verification', { p_location_id: locationId }),
    restroomIntelligence: placeId => rpc('get_public_restroom_intelligence', { p_place_id: placeId })
  });
}
