export const CONSUMER_MEMBERSHIP_PRICE_USD = 5;

/**
 * Consumer contract: every consumer capability is available to Free users.
 * Membership changes advertising, not consumer feature availability.
 */
export const consumerCapabilityAccess = () => true;

export const consumerAdsEnabled = (membershipTier) =>
  String(membershipTier || 'free').toLowerCase() !== 'premium';

export const getConsumerMonetizationState = (membershipTier) => ({
  membershipTier: String(membershipTier || 'free').toLowerCase(),
  allConsumerFeatures: true,
  adsEnabled: consumerAdsEnabled(membershipTier),
  premiumPriceUsd: CONSUMER_MEMBERSHIP_PRICE_USD,
});

export default {
  CONSUMER_MEMBERSHIP_PRICE_USD,
  consumerCapabilityAccess,
  consumerAdsEnabled,
  getConsumerMonetizationState,
};
