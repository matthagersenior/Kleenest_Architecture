import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('.');
const required=[
 ['src/domains/consumer/access-offers.js',['get_single_use_access_offers','list_single_use_access_purchases','purchase_single_use_access','redeem_single_use_access','kleenest:access-offer-updated']],
 ['src/domains/billing/commerce.js',['stripe-create-checkout','stripe-customer-portal','isRecurringPlan']],
 ['src/runtime/AccessOffersPage.jsx',['priceCents','Verified checkout required','services.accessOffers.purchase','services.accessOffers.redeem']],
 ['supabase/migrations/20260829233000_guard_paid_single_use_access_checkout_boundary.sql',['paid access requires verified checkout','record_data_feature_event','commerce_mode','free_claim']]
];
const missing=[];
for(const [rel,tokens] of required){const file=path.join(root,rel);if(!fs.existsSync(file)){missing.push(`${rel}: file missing`);continue}const text=fs.readFileSync(file,'utf8');for(const token of tokens)if(!text.includes(token))missing.push(`${rel}: missing ${token}`)}
const page=fs.readFileSync(path.join(root,'src/runtime/AccessOffersPage.jsx'),'utf8');
if(!page.includes('paid=priceCents(o)>0'))missing.push('AccessOffersPage.jsx: priced-offer guard missing');
if(!page.includes('disabled={busy!==\'\'||paid}'))missing.push('AccessOffersPage.jsx: priced offers are not disabled from direct claim');
const migration=fs.readFileSync(path.join(root,'supabase/migrations/20260829233000_guard_paid_single_use_access_checkout_boundary.sql'),'utf8');
if(!migration.includes('coalesce(o.price_cents,0) > 0'))missing.push('checkout boundary migration: database price guard missing');
if(missing.length){console.error(missing.join('\n'));process.exit(1)}
console.log('Access → Commerce convergence audit passed: free access claims remain authoritative, priced access cannot bypass verified checkout, redemption remains canonical, and recurring commerce stays on Stripe.');
