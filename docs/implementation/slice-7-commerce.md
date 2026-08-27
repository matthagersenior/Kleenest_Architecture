# Slice 7 — Stripe Commerce Vertical

## Authority
- Product catalog: Supabase `pricing_catalog`
- Payment authority: Stripe
- Product entitlement authority: Supabase `subscriptions` / `account_service_entitlements`
- Canonical UI: `/pricing`
- Checkout boundary: Supabase Edge Function `stripe-create-checkout`
- Lifecycle boundary: Supabase Edge Function `stripe-customer-portal`
- Event boundary: Supabase Edge Function `stripe-billing-webhook`

## Flow
`PricingPage → commerce service → stripe-create-checkout → Stripe Checkout → webhook → Supabase subscription/entitlement state → AppContext refresh → capability exposure`

## Implemented
- Stripe test account selected.
- Stripe Billing architecture accepted: hosted Checkout, recurring billing, Customer Portal, webhook-driven state, Smart Retries/recovery, Stripe Tax path.
- Billing customer/subscription/event audit tables added.
- Stripe checkout, customer portal, and webhook Edge Functions deployed.
- Pricing UI now has real recurring checkout and billing-management actions.
- Webhook processing is idempotent by Stripe event ID.
- Business/fleet/enterprise subscription events update the existing Supabase entitlement authority; Stripe does not become the application's feature-gate authority.

## Required configuration before real test checkout
Set Supabase Edge Function secrets:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Configure Stripe webhook endpoint to the deployed `stripe-billing-webhook` function and subscribe to:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## Deliberate boundary
The current production `pricing_catalog` has Premium and Family as `once`, Fleet as monthly, and Enterprise as contact/no-price. Therefore Slice 7 does **not** silently convert Premium/Family into subscriptions or invent Business/Enterprise prices. Those catalog decisions remain product configuration work. Fleet is the currently configured recurring self-serve plan.

## Completion gate
The slice is code-complete but requires the two Edge Function secrets and a Stripe webhook configuration for a live test transaction. No entitlement is granted from a client-side success redirect alone.
