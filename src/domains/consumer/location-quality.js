export function createLocationQualityService(client){
  if(!client) throw new Error('Supabase client is required.');
  const rpc=(name,args={})=>client.rpc(name,args).then(({data,error})=>{if(error)throw error;return data;});
  return Object.freeze({
    submit:(locationId,input)=>rpc('submit_location_quality_observation',{p_location_id:locationId,p_stars:input.stars,p_cleanliness:input.cleanliness,p_accessibility:input.accessibility,p_safety:input.safety,p_availability:input.availability,p_condition:input.condition,p_feedback:input.feedback??null,p_check_in_id:input.checkInId??null,p_photo_id:input.photoId??null,p_metadata:input.metadata??{}}),
    verifyCheckIn:(qrCode,lat,lng)=>rpc('verify_checkin',{p_qr_code:qrCode,p_lat:lat,p_lng:lng}),
    gpsCheckIn:(lat,lng,radiusMeters=100)=>rpc('record_gps_checkin',{p_lat:lat,p_lng:lng,p_radius_meters:radiusMeters}),
    checkInRewards:(checkInId)=>rpc('checkin_rewards_summary',{p_checkin_id:checkInId}),
  });
}
