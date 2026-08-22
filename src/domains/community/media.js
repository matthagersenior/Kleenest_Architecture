export function createCommunityMediaService(client){
  if(!client) throw new Error('Supabase client is required.');
  const rpc=(name,args={})=>client.rpc(name,args).then(({data,error})=>{if(error)throw error;return data;});
  return Object.freeze({
    submitLocationPhoto:(locationId,photo)=>rpc('submit_location_photo_record',{p_location_id:locationId,p_storage_path:photo.storagePath,p_caption:photo.caption??null,p_media_type:photo.mediaType??'image',p_mime_type:photo.mimeType??null,p_size_bytes:photo.sizeBytes??null,p_width:photo.width??null,p_height:photo.height??null}),
    setFeaturedLocationPhoto:(locationId,photoId)=>rpc('set_featured_location_photo',{p_location_id:locationId,p_photo_id:photoId}),
    businessReviewAnalytics:(businessId,start,end)=>rpc('business_review_analytics',{p_business_id:businessId,p_start:start,p_end:end}),
    businessReviewDetail:(businessId,start,end)=>rpc('business_review_detail',{p_business_id:businessId,p_start:start,p_end:end}),
    reviewRewards:(reviewId)=>rpc('review_rewards_summary',{p_review_id:reviewId}),
  });
}
