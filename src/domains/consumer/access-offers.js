import { createActivityEventService } from '../analytics/events.js';

export function createConsumerAccessOfferService(client, analytics = null) {
  if (!client) throw new Error('Supabase client is required.');
  const telemetry = analytics || createActivityEventService(client);
  const call = async (fn, args = {}) => {
    const { data, error } = await client.rpc(fn, args);
    if (error) throw error;
    return data;
  };
  const track = async (eventType, metadata = {}) => {
    try {
      await telemetry?.record?.(eventType, {
        featureCode: 'access_offers',
        subjectType: 'access_offer',
        metadata,
      });
    } catch {}
  };
  const publish = (kind, detail) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kleenest:access-offer-updated', { detail: { kind, ...detail } }));
    }
  };
  return Object.freeze({
    list: () => call('get_single_use_access_offers'),
    purchase: async offerId => {
      const result = await call('purchase_single_use_access', { p_offer_id: offerId });
      await track('access_offer_purchased', { offer_id: offerId, result });
      publish('purchase', { offerId, result });
      return result;
    },
    redeem: async purchaseId => {
      const result = await call('redeem_single_use_access', { p_purchase_id: purchaseId });
      await track('access_offer_redeemed', { purchase_id: purchaseId, result });
      publish('redeem', { purchaseId, result });
      return result;
    },
  });
}
