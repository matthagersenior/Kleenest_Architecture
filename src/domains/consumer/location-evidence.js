export function createLocationEvidenceService(client,{quests=null,intelligence=null}={}) {
  if (!client) throw new Error('Supabase client is required.');
  const rpc = async (name, params) => { const { data, error } = await client.rpc(name, params); if (error) throw error; return data; };
  const booleanValue = value => value === true || value === 'true' || value === '1' || value === 1;
  const numberOrNull = value => value == null || value === '' ? null : Number(value);
  const emit = (type, detail) => { if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(`kleenest:${type}`, { detail })); };
  const evidenceId = result => result?.observation_id || result?.amenity_observation_id || result?.quality_observation_id || result?.evidence_id || result?.id || null;
  async function convergeRouteStop(values,result){
    const checkInId=values.checkInId||null, locationId=values.locationId||null, id=evidenceId(result);
    if(!checkInId||!locationId||!id)return null;
    try{
      const routeResult=await rpc('complete_active_route_stop_after_evidence',{p_location_id:locationId,p_check_in_id:checkInId,p_evidence_id:id});
      if(routeResult?.matched)emit('route-stop-completed',{locationId,checkInId,evidenceId:id,result:routeResult});
      return routeResult;
    }catch{return null;}
  }
  async function convergeTrust(values){
    if(!values?.locationId)return null;
    try{
      const trust=await rpc('refresh_location_trust_state',{p_location_id:values.locationId});
      emit('location-trust-refreshed',{locationId:values.locationId,result:trust});
      return trust;
    }catch{return null;}
  }
  async function convergeIntelligence(values,trust,result,type){
    if(!values?.locationId)return null;
    if(intelligence?.refreshLocation){
      try{return await intelligence.refreshLocation({locationId:values.locationId,evidenceType:type,trust,result});}catch{}
    }
    try{
      const intelligenceResult=await rpc('refresh_location_intelligence',{p_location_id:values.locationId});
      emit('location-intelligence-refreshed',{locationId:values.locationId,result:intelligenceResult});
      return intelligenceResult;
    }catch{return null;}
  }
  async function dispatch(type,values,result){
    await convergeRouteStop(values,result);
    const trust=await convergeTrust(values);
    const intelligenceResult=await convergeIntelligence(values,trust,result,type);
    emit('evidence-created', { evidenceType:type, locationId:values.locationId, checkInId:values.checkInId||null, photoId:values.photoId||null, evidenceId:evidenceId(result), result, trust, intelligence:intelligenceResult });
    emit('location-intelligence-refresh-requested', { locationId:values.locationId, evidenceType:type, photoId:values.photoId||null, trust, intelligence:intelligenceResult });
    if(!quests)return;
    try{await quests.dispatchEvent(type,{locationId:values.locationId,checkinId:values.checkInId||null,metadata:{observationType:values.observationType||null,amenityId:values.amenityId||null,photoId:values.photoId||null,result,trust,intelligence:intelligenceResult}})}catch{}
  }
  return Object.freeze({
    restroomObservation: async values => { const result=await rpc('submit_restroom_observation', { p_location_id: values.locationId, p_check_in_id: values.checkInId || null, p_observation_type: values.observationType, p_cleanliness_pct: numberOrNull(values.cleanlinessPct), p_note: values.note || null }); await dispatch('evidence',values,result); return result; },
    restroomObservationWithPhoto: async values => { const result=await rpc('submit_restroom_observation_with_photo', { p_location_id: values.locationId, p_check_in_id: values.checkInId, p_observation_type: values.observationType, p_cleanliness_pct: numberOrNull(values.cleanlinessPct), p_note: values.note || null, p_photo_id: values.photoId }); await dispatch('evidence',values,result); return result; },
    amenityObservation: async values => { const result=await rpc('submit_amenity_observation', { p_location_id: values.locationId, p_amenity_id: values.amenityId, p_status: values.status, p_confidence: numberOrNull(values.confidence), p_verification_method: values.verificationMethod || null, p_check_in_id: values.checkInId || null, p_photo_id: values.photoId || null, p_notes: values.notes || null, p_metadata: values.metadata || {} }); await dispatch('amenity_observation',values,result); return result; },
    amenityCatalog:()=>rpc('get_amenities_catalog',{}),
    amenityInventory:locationId=>rpc('get_location_amenity_inventory',{p_location_id:locationId}),
    recordReviewAmenityInventory:(reviewId,items)=>rpc('record_review_amenity_inventory',{p_review_id:reviewId,p_items:Array.isArray(items)?items:[]}),
    occupancySummary:locationId=>rpc('get_location_occupancy_summary',{p_location_id:locationId}),
    occupancyObservation:async values=>{const result=await rpc('submit_location_occupancy_observation',{p_location_id:values.locationId,p_occupancy_count:Number(values.occupancyCount),p_capacity_count:numberOrNull(values.capacityCount),p_queue_count:numberOrNull(values.queueCount),p_wait_minutes:numberOrNull(values.waitMinutes),p_confidence:numberOrNull(values.confidence)??0.75,p_observation_method:values.observationMethod||'user',p_check_in_id:values.checkInId||null,p_metadata:values.metadata||{}});await dispatch('occupancy_observation',values,result);return result;},
    qualityObservation: async values => { const result=await rpc('submit_location_quality_observation', { p_location_id: values.locationId, p_stars: Number(values.stars), p_cleanliness: numberOrNull(values.cleanliness), p_accessibility: numberOrNull(values.accessibility), p_safety: numberOrNull(values.safety), p_availability: numberOrNull(values.availability), p_condition: numberOrNull(values.condition), p_feedback: values.feedback || null, p_check_in_id: values.checkInId || null, p_photo_id: values.photoId || null, p_metadata: values.metadata || {} }); await dispatch('quality_observation',values,result); return result; },
    verification: async values => { const result=await rpc('submit_location_verification', { p_location_id: values.locationId, p_is_open: booleanValue(values.isOpen), p_has_bathroom: booleanValue(values.hasBathroom), p_note: values.note || null }); await dispatch('verification',values,result); return result; },
    trustedBathroomVerification: async values => { const result=await rpc('record_bathroom_verification', { p_location_id: values.locationId, p_has_public_bathroom: booleanValue(values.hasPublicBathroom), p_lat: Number(values.latitude), p_lng: Number(values.longitude), p_distance_meters: Number(values.distanceMeters || 0) }); await dispatch('bathroom_verification',values,result); return result; },
    bathroomStatus: locationId => rpc('get_location_bathroom_verification', { p_location_id: locationId }),
    restroomIntelligence: placeId => rpc('get_public_restroom_intelligence', { p_place_id: placeId })
  });
}
