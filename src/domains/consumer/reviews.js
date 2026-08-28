export function createReviewService(client,{quests=null}={}) {
  if (!client) throw new Error('Supabase client is required.');
  function emit(type, detail) { if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(`kleenest:${type}`, { detail })); }
  return Object.freeze({
    create: async ({ locationId, checkInId = null, stars, cleanlinessPct = null, comment = null }) => {
      if (!locationId || !checkInId || !Number.isFinite(Number(stars))) throw new Error('A verified check-in and rating are required to publish a review.');
      const { data, error } = await client.rpc('create_review', { p_location_id: locationId, p_check_in_id: checkInId, p_stars: Number(stars), p_cleanliness_pct: cleanlinessPct == null ? null : Number(cleanlinessPct), p_comment: comment });
      if (error) throw error;
      const reviewId=data?.id || data?.review_id || null;
      emit('review-created', { review: data, reviewId, locationId, checkInId });
      emit('progression-updated', { type: 'review_created', review: data, reviewId, locationId });
      if (quests) { try { await quests.dispatchEvent('review', { locationId, checkinId: checkInId, metadata:{reviewId} }); } catch {} }
      return data;
    },
    rewards: async reviewId => { if (!reviewId) throw new Error('Review is required.'); const { data, error } = await client.rpc('review_rewards_summary', { p_review_id: reviewId }); if (error) throw error; return data; },
    like: async reviewId => { if (!reviewId) throw new Error('Review is required.'); const { data, error } = await client.rpc('toggle_review_like', { p_review_id: reviewId }); if (error) throw error; return data; },
    amenityFeedback: async (reviewId, goodAmenityIds = [], attentionAmenityIds = []) => { if (!reviewId) throw new Error('Review is required.'); const { data, error } = await client.rpc('record_review_amenity_feedback', { p_review_id: reviewId, p_good_amenity_ids: goodAmenityIds, p_attention_amenity_ids: attentionAmenityIds }); if (error) throw error; emit('review-evidence-updated', { reviewId, result: data }); emit('progression-updated', { type: 'review_evidence_updated', reviewId, result: data }); return data; }
  });
}
