export function createCommunityMediaService(client){
  if(!client) throw new Error('Supabase client is required.');
  const rpc=(name,args={})=>client.rpc(name,args).then(({data,error})=>{if(error)throw error;return data;});
  return Object.freeze({
    uploadReviewPhoto:(reviewId,storagePath)=>rpc('upload_review_photo',{p_review_id:reviewId,p_storage_path:storagePath}),
    reviewPhotos:(reviewId)=>rpc('get_review_photos',{p_review_id:reviewId}),
    locationPhotos:(locationId,limit=50)=>rpc('get_location_photos',{p_location_id:locationId,p_limit:Number(limit)}),
    arrivalAnalytics:(locationId)=>rpc('get_arrival_analytics',{p_location_id:locationId}),
    directionsAnalytics:(locationId)=>rpc('get_directions_analytics',{p_location_id:locationId}),
  });
}
