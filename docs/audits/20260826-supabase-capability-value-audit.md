# Kleenest Supabase Capability & Product Value Audit

**Date:** 2026-08-26  
**Repository:** `Kleenest_Architecture/main`  
**Supabase project:** production project linked to this architecture

## Executive finding

Kleenest has materially more backend capability than is currently exposed as product value. The database currently contains **199 public tables and 431 public routines**, with a capability registry classifying **164 routines as canonical, 204 supporting, 30 compatibility, 27 trigger helpers, and 17 legacy**.

The strongest opportunity is not adding random features. It is turning existing capability clusters into two coherent products:

1. **Kleenest Consumer** — restroom discovery, trusted bathroom intelligence, check-ins, evidence, routes, QR, geofencing, quests/rewards, community and personalized location intelligence.
2. **Kleenest Business** — location ownership, verified listings, amenities, campaigns, promotions, QR engagement, events, media, customer engagement analytics, partnerships, business intelligence and optional fleet/enterprise operations.

The shared backend should remain one canonical platform. The mobile products should become separate clients over that platform.

## Live Supabase capability inventory

### Extensions currently enabled

- `postgis` — geospatial queries, distance/radius logic and spatial location intelligence.
- `pg_cron` — scheduled intelligence refreshes, maintenance, aggregation and lifecycle jobs.
- `pg_net` — asynchronous HTTP calls from Postgres; useful for Edge Function orchestration.
- `supabase_vault` — secure secrets for scheduled/Edge integrations.
- `pgcrypto`, `uuid-ossp` — cryptographic/identity primitives.
- `pg_stat_statements` — query-performance observability.

### Important gap

`pgvector` and `pgmq` are **not currently enabled**. Supabase supports combining pgvector, queues, pg_net, pg_cron, triggers and Edge Functions for asynchronous semantic-search/AI pipelines. This is a high-value future capability, but it should be introduced only after the core product split and security baseline are stable.

## Existing capability clusters with product value

| Capability | Existing evidence | Product value | Priority |
|---|---|---|---|
| Universal location discovery | canonical discovery RPC + location tables | Core consumer map/search | P0 |
| Bathroom intelligence | intelligence table + compute/refresh RPCs | Trustworthy restroom status, access and confidence | P0 |
| Location observations | observations, votes, confidence, verification | Community-powered data network | P0 |
| Quality observations/reviews | quality observation tables/RPCs | Cleanliness/accessibility/safety scoring | P0 |
| Amenities | location amenities + observations | Better filters and business upsell surface | P0 |
| QR access | QR codes, attribution, redemptions, engagement programs | Check-in, offers, attribution, loyalty | P0 |
| Geofencing | business geofences + events + notification path | Contextual arrival/engagement | P0 |
| Quests | quests, steps, participation, event dispatch | Retention and contribution loops | P0 |
| Reputation | contributor reputation + consistency audit | Trust weighting and anti-abuse | P0 |
| Routes | route plans/events/discovery locations | Multi-stop restroom planning | P1 |
| Offline maps | offline pack locations/businesses/events | Reliable travel use | P1 |
| Preferred locations | activations/usage analytics | Personalization | P1 |
| Live network events | live event tables/RPC | Local real-time discovery | P1 |
| Notifications | notification events/deliveries/push subscriptions | Re-engagement and contextual alerts | P1 |
| Business campaigns | campaigns + analytics | Paid marketing product | P0 business |
| Business promotions | promotions + redemptions + analytics | Consumer conversion | P0 business |
| Business QR | QR creation/customization/status/analytics | Measurable physical-to-digital marketing | P0 business |
| Business events | events + RSVPs + analytics | Local discovery/activation | P1 business |
| Business media | media/storage metadata | Listing merchandising | P1 business |
| Business partnerships | partner programs, allocations, ROI | B2B network monetization | P1 business |
| Business intelligence | growth, location, engagement, ROI, benchmarks | Paid decision-support | P0 business |
| Business contests | contests/leaderboards/rewards | Promotional engagement | P2 business |
| Fleet | vehicles/drivers/routes/maintenance/metrics | Enterprise operational product | P2 |
| Enterprise partner networks | network campaigns, allocations, outcomes | Enterprise expansion | P2 |
| Single-use access offers | offers/purchases/redemptions | Transactional monetization | P2 |
| Game/challenge capability | game challenges/results | Optional engagement layer | P2 |
| Family/social capability | family groups/invites/follows | Social retention | P2 |

## High-value feature ideas already supported by the architecture

### 1. Trust Score for every restroom
Combine bathroom intelligence, verification age, observation count, contributor reputation, conflict state and freshness into one user-facing trust indicator.

### 2. Live restroom confidence
Use recent observations + visits + amenity confirmations + time decay to show whether a restroom is likely open, accessible and usable **now**, without presenting stale data as fact.

### 3. Restroom reliability routing
Route discovery can score stops by distance plus trust, access, cleanliness, availability and confidence instead of distance alone.

### 4. Smart restroom alerts
Geofence + notification + intelligence can warn users about a nearby high-confidence restroom when they are approaching a planned stop, while respecting foreground/background location policy constraints.

### 5. Physical QR engagement platform
Businesses can place Kleenest QR codes at restroom entrances. Scans can trigger check-in, offers, feedback, loyalty, quests and attribution. This creates measurable offline-to-online marketing.

### 6. Business restroom health score
Turn consumer observations into a business-facing operational score: cleanliness, accessibility, availability, amenity reliability, complaint rate, freshness and response rate.

### 7. Campaign ROI loop
Campaign → location exposure → QR/geofence → visit/check-in → promotion redemption → review → repeat visit. Existing attribution/analytics tables can support an end-to-end ROI product.

### 8. Benchmarking
Business intelligence already contains benchmark/leaderboard-style capability. Package it as "How your restroom performs vs. comparable locations" rather than exposing raw analytics.

### 9. Location claim + verification product
A business claims a location, verifies it, manages amenities/media/QR/promotions and becomes the authoritative operator for that location without replacing the consumer-generated evidence layer.

### 10. Offline travel mode
Offline packs can cache nearby locations, business data and events for travelers. The user can still discover/rest-stop plan when connectivity is poor and synchronize contributions later.

### 11. Semantic restroom search / AI assistant
Future pgvector + Edge Functions can support queries such as "quiet, accessible restroom near downtown" using structured facts plus semantic descriptions. This is a later phase, not a replacement for canonical map search.

### 12. Predictive demand/occupancy
Existing occupancy and amenity data can evolve into time-of-day demand predictions. This should be presented as a forecast with confidence, not a false real-time measurement.

## Security findings that block store readiness

The live Supabase security advisor currently reports several important classes of findings:

1. `public.location_bathroom_signals` is a SECURITY DEFINER view.
2. `public.location_bathroom_intelligence` has RLS disabled.
3. Capability governance/audit tables have RLS disabled.
4. A mutable search path remains on `capability_retirement_audit`.
5. A large set of SECURITY DEFINER RPCs are executable by `anon` or `authenticated` roles. Some may be intentional, but each must be explicitly classified as public-read, authenticated-user action, business-member action, admin-only, or internal-only.
6. Leaked-password protection is disabled.

These findings should become a dedicated pre-store hardening gate. SECURITY DEFINER itself is not automatically wrong; **unbounded EXECUTE privilege is the problem**.

## Product conclusion

Do not create two independent databases or duplicate backend logic. Create two product clients around the same canonical platform:

`Kleenest Platform`
→ `Kleenest Consumer`
→ `Kleenest Business`

Shared: auth, locations, geospatial intelligence, identity, evidence, analytics, QR, notifications, progression primitives and security.  
Consumer-owned UX: discovery, routes, contribution, quests, reputation, community.  
Business-owned UX: claim/manage, marketing, QR, promotions, events, analytics, partnerships and enterprise operations.

## Immediate implementation order

1. Security/privilege audit and RLS baseline.
2. New interoperability matrix v2.
3. Explicit consumer/business capability ownership map.
4. Create `apps/business-mobile` as a true Expo product rather than wrapping the existing web app.
5. Extract shared platform/client packages under `packages/`.
6. Finish consumer critical-path QA.
7. Build business critical-path QA.
8. Add store privacy/permission disclosures.
9. Establish EAS production builds, signing, OTA/update policy and release channels.
10. Run TestFlight and Google Play closed testing.
11. Complete store metadata, privacy, data-safety, account deletion and permission declarations.
12. Public release followed by staged market rollout.
