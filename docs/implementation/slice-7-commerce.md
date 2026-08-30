# Slice 7 — Stripe Commerce Vertical

## Authority
- Product catalog and self-serve price/mode authority: Supabase `pricing_catalog`
- Payment authority: Stripe
- Consumer one-time membership authority: `profiles.subscription_tier`
- Organizational recurring entitlement authority: `subscriptions` / `account_service_entitlements`
- Canonical UI: `/pricing`
- Checkout boundary: Supabase Edge Function `stripe-create-checkout`
- Lifecycle boundary: Supabase Edge Function `stripe-customer-portal`
- Event boundary: Supabase Edge Function `stripe-billing-webhook`

## Flow
`PricingPage → commerce service → pricing_catalog → stripe-create-checkout → Stripe Checkout → webhook → Supabase membership/subscription/entitlement state → AppContext refresh → capability exposure`

## Implemented
- Stripe hosted Checkout selects `payment` mode for active `once` catalog products and `subscription` mode for active monthly products.
- Consumer Premium is a one-time $5 purchase; Family remains a one-time purchase. Neither is silently converted into a recurring subscription.
- Business Standard, Business Growth, and Fleet use their active monthly `pricing_catalog` records for recurring Checkout.
- Contact/no-price products are not offered as self-serve Checkout.
- One-time consumer access is granted only after a verified paid `checkout.session.completed` webhook. A success redirect alone grants nothing.
- One-time membership fulfillment advances `profiles.subscription_tier` without downgrading an existing higher tier and records a Stripe payment audit row in `subscriptions`.
- Recurring subscription events write `subscriptions.plan_code` and converge eligible Business/Fleet/Enterprise access into `account_service_entitlements`.
- `subscriptions.plan_code` references `pricing_catalog(code)` so Stripe billing state remains traceable to the same catalog the UI presents.
- Webhook processing remains idempotent by Stripe event ID.
- Customer Portal is exposed only for active Stripe recurring billing, not permanent one-time purchases.

## Product boundary
The production catalog is authoritative. Current configured behavior includes Premium and Family as `once`, Business Standard/Business Growth/Fleet as monthly self-serve plans, and Business Enterprise as contact/no-price. Checkout must honor those configured modes rather than infer that every paid product is recurring.

## Required Stripe configuration
The deployed Edge Functions require:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

The Stripe webhook endpoint must include:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## Completion gate
Code, schema, and Edge Function boundaries are converged when the static commerce audit passes and both Edge Functions are deployed with their intended authentication settings. A real transaction still requires an authenticated user to complete Stripe Checkout; no client redirect is treated as proof of payment.
