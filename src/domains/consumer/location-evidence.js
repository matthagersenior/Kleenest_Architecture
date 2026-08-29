export function createLocationEvidenceService(client,{quests=null}={}) {
  if (!client) throw new Error('Supabase client is required.');
  const rpc = async (name, params) => { const { data, error } = await client.rpc(name, params); if (error) throw error; return data; };
  const booleanValue = value => value === true || value === 'true' || value === '1' || value === 1;
  const numberOrNull = value => value == null || value === '' ? null : Number(value);
  const emit = (type, detail) => { if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(`kleenest:${type}`, { detail })); };
  const evidenceId = result => result?.observation_id || result?.amenity_observation_id || result?.quality_observation_id || result?.evidence_id || null;
  async function convergeRouteStop(values,result){
    const checkInId=values.checkInId||null, locationId=values.locationId||null, id=evidenceId(result);
    if(!checkInId||!locationId||!id)return null;
    try{
      const routeResult=await rpc('complete_active_route_stop_after_evidence',{p_location_id:locationId,p_check_in_id:checkInId,p_evidence_id:id});
      if(routeResult?.matched)emit('route-stop-completed',{locationId,checkInId,evidenceId:id,result:routeResult});
      return routeResult;
    }catch{return null;}
  }
  async function dispatch(type,values,result){
    await convergeRouteStop(values,result);
    emit('evidence-created', { evidenceType:type, locationId:values.locationId, checkInId:values.checkInId||null, evidenceId:evidenceId(result), result });
    emit('location-intelligence-refresh-requested', { locationId:values.locationId, evidenceType:type });
    if(!quests)return;
    try{await quests.dispatchEvent(type,{locationId:values.locationId,checkinId:values.checkInId||null,metadata:{observationType:values.observationType||null,amenityId:values.amenityId||null,result}})}catch{}
  }
  return Object.freeze({
    restroomObservation: async values => { const result=await rpc('submit_restroom_observation', { p_location_id: values.locationId, p_check_in_id: values.checkInId || null, p_observation_type: values.observationType, p_cleanliness_pct: numberOrNull(values.cleanlinessPct), p_note: values.note || null }); await dispatch('evidence',values,result); return result; },
    amenityObservation: async values => { const result=await rpc('submit_amenity_observation', { p_location_id: values.locationId, p_amenity_id: values.amenityId, p_status: values.status, p_confidence: numberOrNull(values.confidence), p_verification_method: values.verificationMethod || null, p_check_in_id: values.checkInId || null, p_photo_id: values.photoId || null, p_notes: values.notes || null, p_metadata: values.metadata || {} }); await dispatch('amenity_observation',values,result); return result; },
    qualityObservation: async values => { const result=await rpc('submit_location_quality_observation', { p_location_id: values.locationId, p_stars: Number(values.stars), p_cleanliness: numberOrNull(values.cleanliness), p_accessibility: numberOrNull(values.accessibility), p_safety: numberOrNull(values.safety), p_availability: numberOrNull(values.availability), p_condition: numberOrNull(values.condition), p_feedback: values.feedback || null, p_check_in_id: values.checkInId || null, p_photo_id: values.photoId || null, p_metadata: values.metadata || {} }); await dispatch('quality_observation',values,result); return result; },
    verification: async values => { const result=await rpc('submit_location_verification', { p_location_id: values.locationId, p_is_open: booleanValue(values.isOpen), p_has_bathroom: booleanValue(values.hasBathroom), p_note: values.note || null }); await dispatch('verification',values,result); return result; },
    trustedBathroomVerification: async values => { const result=await rpc('record_bathroom_verification', { p_location_id: values.locationId, p_has_public_bathroom: booleanValue(values.hasPublicBathroom), p_lat: Number(values.latitude), p_lng: Number(values.longitude), p_distance_meters: Number(values.distanceMeters || 0) }); await dispatch('bathroom_verification',values,result); return result; },
    bathroomStatus: locationId => rpc('get_location_bathroom_verification', { p_location_id: locationId }),
    restroomIntelligence: placeId => rpc('get_public_restroom_intelligence', { p_place_id: placeId })
  });
}
