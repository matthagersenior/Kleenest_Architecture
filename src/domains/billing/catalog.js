export const PRODUCT_TYPES = Object.freeze({ ONE_TIME: 'one_time', RECURRING: 'recurring' });
export const PRODUCT_CODES = Object.freeze({ PREMIUM: 'premium', FAMILY: 'family', BUSINESS: 'business', FLEET: 'fleet', ENTERPRISE: 'enterprise' });
const FALLBACK_COMMERCIAL_MODEL = Object.freeze({ premium: { type: PRODUCT_TYPES.ONE_TIME, priceCents: 500, currency: 'USD', interval: null }, family: { type: PRODUCT_TYPES.ONE_TIME, priceCents: 2000, currency: 'USD', interval: null, maxMembers: 5 }, business: { type: PRODUCT_TYPES.RECURRING, currency: 'USD', interval: 'month' }, fleet: { type: PRODUCT_TYPES.RECURRING, currency: 'USD', interval: 'month' }, enterprise: { type: PRODUCT_TYPES.RECURRING, currency: 'USD', interval: 'month' } });
export function normalizePlan(plan) { const code = String(plan?.code ?? plan?.slug ?? plan?.tier ?? '').toLowerCase(); const fallback = FALLBACK_COMMERCIAL_MODEL[code] ?? {}; return Object.freeze({ ...plan, code, billingType: plan?.billing_type ?? plan?.type ?? fallback.type ?? null, priceCents: Number(plan?.price_cents ?? fallback.priceCents ?? 0), currency: String(plan?.currency ?? fallback.currency ?? 'USD').toUpperCase(), interval: plan?.interval ?? fallback.interval ?? null, maxMembers: Number(plan?.max_members ?? fallback.maxMembers ?? 0) || null }); }
export function isOneTimePlan(plan) { return normalizePlan(plan).billingType === PRODUCT_TYPES.ONE_TIME; }
export function isRecurringPlan(plan) { return normalizePlan(plan).billingType === PRODUCT_TYPES.RECURRING; }
export function getCommercialModel(code) { return FALLBACK_COMMERCIAL_MODEL[String(code ?? '').toLowerCase()] ?? null; }
export function createBillingService(client) { if (!client) throw new Error('Supabase client is required.'); return Object.freeze({
  listPlans: async () => { const { data, error } = await client.from('pricing_catalog').select('*').eq('active', true).order('price_cents', { ascending: true }); if (error) throw error; return (data ?? []).map(normalizePlan); },
  getMySubscription: async () => { const { data, error } = await client.rpc('user_subscription_summary'); if (error) throw error; return Array.isArray(data) ? data[0] ?? null : data ?? null; },
  getMyEntitlements: async () => { const { data, error } = await client.rpc('get_current_user_product_entitlements'); if (error) throw error; return Array.isArray(data) ? data : data ? [data] : []; },
  getCommercialModel
}); }
