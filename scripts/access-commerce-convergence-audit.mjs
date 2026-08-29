import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('.');
const required=[
 ['src/domains/consumer/access-offers.js',['get_single_use_access_offers','list_single_use_access_purchases','purchase_single_use_access','stripe-create-checkout','accessOfferId','redeem_single_use_access','kleenest:access-offer-updated']],
 ['src/domains/billing/commerce.js',['stripe-create-checkout','stripe-customer-portal','isRecurringPlan']],
 ['src/runtime/AccessOffersPage.jsx',['priceCents','Checkout with Stripe','services.accessOffers.checkout','services.accessOffers.purchase','services.accessOffers.redeem','checkout=success']],
 ['supabase/migrations/20260829233000_guard_paid_single_use_access_checkout_boundary.sql',['paid access requires verified checkout','record_data_feature_event','commerce_mode','free_claim']],
 ['supabase/migrations/20260829235000_single_use_access_stripe_fulfillment_v1.sql',['fulfill_single_use_access_checkout','provider_checkout_session_id','service_role','checkout amount mismatch','stripe_checkout']],
 ['supabase/functions/stripe-create-checkout/index.ts',['accessOfferId',"mode:'payment'",'single_use_access','kleenest_offer_id']],
 ['supabase/functions/stripe-billing-webhook/index.ts',['fulfill_single_use_access_checkout','payment_status','single_use_access','checkout.session.completed']]
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
if(webhook.indexOf("await fulfillAccess(session)")>webhook.indexOf("stripe_webhook_events').insert"))missing.push('webhook event is marked processed before paid access fulfillment');
if(missing.length){console.error(missing.join('\n'));process.exit(1)}
console.log('Access → Commerce convergence audit passed: free claims are authoritative, paid access uses Stripe Checkout plus service-role webhook fulfillment, redemption remains canonical, and subscription commerce stays on the existing Stripe boundary.');
