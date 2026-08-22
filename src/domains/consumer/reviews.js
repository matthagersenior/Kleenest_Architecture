export function createReviewService(client) {
  if (!client) throw new Error('Supabase client is required.');
  return Object.freeze({
    create: async ({ locationId, checkInId = null, stars, cleanlinessPct = null, comment = null }) => {
      if (!locationId || !Number.isFinite(Number(stars))) throw new Error('Location and rating are required.');
      const { data, error } = await client.rpc('create_review', {
        p_location_id: locationId,
        p_check_in_id: checkInId,
        p_stars: Number(stars),
        p_cleanliness_pct: cleanlinessPct == null ? null : Number(cleanlinessPct),
        p_comment: comment
      });
      if (error) throw error;
      return data;
    },
    rewards: async reviewId => {
      if (!reviewId) throw new Error('Review is required.');
      const { data, error } = await client.rpc('review_rewards_summary', { p_review_id: reviewId });
      if (error) throw error;
      return data;
    },
    like: async reviewId => {
      if (!reviewId) throw new Error('Review is required.');
      const { data, error } = await client.rpc('toggle_review_like', { p_review_id: reviewId });
      if (error) throw error;
      return data;
    },
    amenityFeedback: async (reviewId, goodAmenityIds = [], attentionAmenityIds = []) => {
      if (!reviewId) throw new Error('Review is required.');
      const { data, error } = await client.rpc('record_review_amenity_feedback', {
        p_review_id: reviewId,
        p_good_amenity_ids: goodAmenityIds,
        p_attention_amenity_ids: attentionAmenityIds
      });
      if (error) throw error;
      return data;
    }
  });
}
