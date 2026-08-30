import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('.');
const required=[
 ['src/domains/consumer/access-offers.js',['get_single_use_access_offers','list_single_use_access_purchases','purchase_single_use_access','stripe-create-checkout','accessOfferId','redeem_single_use_access','kleenest:access-offer-updated']],
 ['src/domains/billing/catalog.js',["interval === 'once'",'max_users','PRODUCT_TYPES.ONE_TIME','PRODUCT_TYPES.RECURRING','rowTime','aRecurring']],
 ['src/domains/billing/commerce.js',['stripe-create-checkout','stripe-customer-portal','isRecurringPlan','isOneTimePlan','pricing_catalog','CHECKOUT_SOURCE_CODES']],
 ['src/runtime/PricingPage.jsx',['useSearchParams','oneTime','Buy ${card.copy.title}','refreshAuthContext','consumerRank','Included in current membership','recurringCode','syncDelays','checkoutConfirmed','session_id','kleenest:billing-updated']],
 ['src/runtime/AccessOffersPage.jsx',['priceCents','Checkout with Stripe','services.accessOffers.checkout','services.accessOffers.purchase','services.accessOffers.redeem','checkout=success']],
 ['supabase/migrations/20260829233000_guard_paid_single_use_access_checkout_boundary.sql',['paid access requires verified checkout','record_data_feature_event','commerce_mode','free_claim']],
 ['supabase/migrations/20260829235000_single_use_access_stripe_fulfillment_v1.sql',['fulfill_single_use_access_checkout','provider_checkout_session_id','service_role','checkout amount mismatch','stripe_checkout']],
 ['supabase/migrations/20260830082054_commerce_plan_code_convergence_v1.sql',['plan_code','pricing_catalog(code)','subscriptions_user_plan_code_status_idx']],
 ['supabase/migrations/20260830083003_subscriptions_plan_code_fk_index_v1.sql',['subscriptions_plan_code_idx','subscriptions(plan_code)']],
 ['supabase/functions/stripe-create-checkout/index.ts',['accessOfferId',"mode:'payment'",'single_use_access','kleenest_offer_id','pricing_catalog','membership_one_time',"mode:'subscription'",'plan_code','planSuccess','CHECKOUT_SESSION_ID']],
 ['supabase/functions/stripe-billing-webhook/index.ts',['fulfill_single_use_access_checkout','payment_status','single_use_access','checkout.session.completed','fulfillMembership','membership_one_time','plan_code','stripe_payment','recomputeOrganizationEntitlement','orgEntitlements']]
];
const missing=[];
for(const [rel,tokens] of required){const file=path.join(root,rel);if(!fs.existsSync(file)){missing.push(`${rel}: file missing`);continue}const text=fs.readFileSync(file,'utf8');for(const token of tokens)if(!text.includes(token))missing.push(`${rel}: missing ${token}`)}
const page=fs.readFileSync(path.join(root,'src/runtime/AccessOffersPage.jsx'),'utf8');
if(!page.includes('paid=priceCents(o)>0'))missing.push('AccessOffersPage.jsx: priced-offer classification missing');
if(!page.includes("paid?(busy===`checkout:${o.id}`?'Opening checkout…':'Checkout with Stripe')"))missing.push('AccessOffersPage.jsx: priced offers do not route to verified Stripe checkout');
const freeGuard=fs.readFileSync(path.join(root,'supabase/migrations/20260829233000_guard_paid_single_use_access_checkout_boundary.sql'),'utf8');
if(!freeGuard.includes('coalesce(o.price_cents,0) > 0'))missing.push('checkout boundary migration: database direct-claim price guard missing');
const fulfillment=fs.readFileSync(path.join(root,'supabase/migrations/20260829235000_single_use_access_stripe_fulfillment_v1.sql'),'utf8');
if(!fulfillment.includes('grant execute on function public.fulfill_single_use_access_checkout(uuid,uuid,text,integer) to service_role'))missing.push('paid fulfillment RPC is not service-role-only');
const webhook=fs.readFileSync(path.join(root,'supabase/functions/stripe-billing-webhook/index.ts'),'utf8');
if(webhook.indexOf('await fulfillAccess(session)')>webhook.indexOf("stripe_webhook_events').insert"))missing.push('webhook event is marked processed before paid access fulfillment');
if(webhook.indexOf('await fulfillMembership(session)')>webhook.indexOf("stripe_webhook_events').insert"))missing.push('webhook event is marked processed before membership fulfillment');
if(!webhook.includes(".eq('provider','stripe').in('status',['active','trialing','past_due'])"))missing.push('webhook does not recompute organization entitlements from all live recurring subscriptions');
if(!webhook.includes('sort((a,b)=>b.rank-a.rank)'))missing.push('webhook does not resolve the highest active organization entitlement');
const pricing=fs.readFileSync(path.join(root,'src/runtime/PricingPage.jsx'),'utf8');
if(!pricing.includes("const oneTime=card.interval==='once'"))missing.push('PricingPage.jsx: one-time membership classification missing');
if(!pricing.includes('(recurring||oneTime)'))missing.push('PricingPage.jsx: one-time plans are not purchasable');
if(!pricing.includes('(consumerRank[membershipTier]??0)>=(consumerRank[target]??0)'))missing.push('PricingPage.jsx: inherited one-time membership access is not guarded');
if(!pricing.includes("sub?.provider==='stripe'"))missing.push('PricingPage.jsx: recurring checkout confirmation is not Stripe-backed');
if(!pricing.includes('syncDelays.length-1'))missing.push('PricingPage.jsx: post-checkout convergence retry boundary missing');
const checkout=fs.readFileSync(path.join(root,'supabase/functions/stripe-create-checkout/index.ts'),'utf8');
if(!checkout.includes("plan.interval==='once'?'membership_one_time':'subscription'"))missing.push('Stripe checkout does not derive mode from canonical catalog interval');
if(!checkout.includes('plan=${encodeURIComponent(planCode)}&session_id={CHECKOUT_SESSION_ID}'))missing.push('Stripe checkout success redirect does not carry an authoritative plan/session target');
if(missing.length){console.error(missing.join('\n'));process.exit(1)}
console.log('Access → Commerce convergence audit passed: free access claims remain authoritative, paid access offers and one-time consumer memberships use Stripe payment-mode fulfillment, recurring catalog plans use subscription mode, organization entitlements recompute from all active recurring billing rows, inherited consumer membership access cannot be redundantly repurchased, and checkout redirects converge against the exact Stripe-backed target before declaring access active.');
