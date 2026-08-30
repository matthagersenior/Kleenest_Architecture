import { PRODUCT_CODES, normalizePlan, isOneTimePlan, isRecurringPlan } from './catalog.js';

const DISPLAY_CODES = Object.freeze({ premium_user: 'premium', business_standard: 'business', business_growth: 'business', business_enterprise: 'enterprise' });
const CHECKOUT_SOURCE_CODES = Object.freeze({ premium: 'premium_user' });
function canonicalProduct(row) { const plan = normalizePlan(row); const code = DISPLAY_CODES[plan.code] || plan.code; return Object.freeze({ ...plan, sourceCode: plan.code, code }); }

export function createCommerceService(client) {
  if (!client) throw new Error('Supabase client is required.');
  const invoke = async (name, body) => { const { data, error } = await client.functions.invoke(name, { body }); if (error) throw error; if (data?.error) throw new Error(data.error); return data; };
  return Object.freeze({
    listProducts: async () => { const { data, error } = await client.from('pricing_catalog').select('*').eq('active', true).order('price_cents', { ascending: true, nullsFirst: false }); if (error) throw error; return (data ?? []).map(canonicalProduct); },
    classifyProduct: product => { const plan = canonicalProduct(product); return Object.freeze({ code: plan.code, sourceCode: plan.sourceCode, type: isOneTimePlan(plan) ? 'one_time' : isRecurringPlan(plan) ? 'recurring' : 'unknown', priceCents: plan.priceCents, interval: plan.interval, maxMembers: plan.maxMembers }); },
    getProduct: async code => { const requested = String(code).toLowerCase(); const sourceCodes = Object.entries(DISPLAY_CODES).filter(([, value]) => value === requested).map(([key]) => key); const { data, error } = await client.from('pricing_catalog').select('*').eq('active', true).in('code', [requested, ...sourceCodes]).order('price_cents', { ascending: true, nullsFirst: false }); if (error) throw error; return data?.[0] ? canonicalProduct(data[0]) : null; },
    createCheckout: async (planCode, options={}) => { const requested=String(planCode).toLowerCase(); const sourceCode=CHECKOUT_SOURCE_CODES[requested]||requested; const {data,error}=await client.from('pricing_catalog').select('*').eq('active',true).eq('code',sourceCode).maybeSingle(); if(error)throw error; const product=data?canonicalProduct(data):null; if(!product)throw new Error('Plan is unavailable.'); if(!(isOneTimePlan(product)||isRecurringPlan(product))||!product.priceCents)throw new Error('This plan is not configured for self-serve checkout.'); return invoke('stripe-create-checkout',{planCode:product.sourceCode,successUrl:options.successUrl,cancelUrl:options.cancelUrl}); },
    openCustomerPortal: async () => invoke('stripe-customer-portal', {}),
    getPurchaseCopy: code => ({ premium: { title: 'Premium', price: '$5', billing: 'One time', description: 'Remove ads permanently from the complete consumer experience.' }, family: { title: 'Family', price: '$20', billing: 'One time', description: 'Family membership for up to 5 people.' }, business: { title: 'Business', price: 'From $20/mo', billing: 'Recurring', description: 'Business growth and engagement tools.' }, fleet: { title: 'Fleet', price: '$75/mo', billing: 'Recurring', description: 'Operational routing, metrics, and goals.' }, enterprise: { title: 'Enterprise', price: 'Contact us', billing: 'Recurring', description: 'Advanced data, partnerships, campaigns, and intelligence.' } }[String(code).toLowerCase()] ?? null),
    PRODUCT_CODES
  });
}
