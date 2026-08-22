export function createBillingService(client) {
  if (!client) throw new Error('Supabase client is required.');
  return Object.freeze({
    listPlans: async () => { const { data, error } = await client.from('pricing_catalog').select('*').eq('active', true).order('price_cents', { ascending: true }); if (error) throw error; return data ?? []; },
    getMySubscription: async userId => { if (!userId) return null; const { data, error } = await client.from('subscriptions').select('id,status,provider,provider_customer_id,provider_subscription_id,current_period_start,current_period_end,subscription_plans(code,name,tier,price_cents,interval,features)').eq('user_id', userId).eq('status', 'active').maybeSingle(); if (error) throw error; return data; }
  });
}
