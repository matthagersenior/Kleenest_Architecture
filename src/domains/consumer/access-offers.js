export function createConsumerAccessOfferService(client) {
  if (!client) throw new Error('Supabase client is required.');
  const call = async (fn, args = {}) => {
    const { data, error } = await client.rpc(fn, args);
    if (error) throw error;
    return data;
  };
  const publish = (kind, detail) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kleenest:access-offer-updated', { detail: { kind, ...detail } }));
    }
  };
  return Object.freeze({
    list: () => call('get_single_use_access_offers'),
    listPurchases: () => call('list_single_use_access_purchases'),
    purchase: async offerId => {
      const result = await call('purchase_single_use_access', { p_offer_id: offerId });
      publish('purchase', { offerId, result });
      return result;
    },
    checkout: async (offerId, { successUrl, cancelUrl } = {}) => {
      if (!offerId) throw new Error('An access offer is required.');
      const { data, error } = await client.functions.invoke('stripe-create-checkout', {
        body: { accessOfferId: offerId, successUrl, cancelUrl },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.url) throw new Error('Stripe checkout did not return a checkout URL.');
      publish('checkout', { offerId, sessionId: data.sessionId ?? null });
      return data;
    },
    redeem: async purchaseId => {
      const result = await call('redeem_single_use_access', { p_purchase_id: purchaseId });
      publish('redeem', { purchaseId, result });
      return result;
    },
  });
}
