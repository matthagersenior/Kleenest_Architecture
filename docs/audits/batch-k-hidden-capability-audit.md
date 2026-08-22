# Batch K — Hidden capability / cross-repository audit

Date: 2026-08-22

## Sources inspected

- `matthagersenior/KleenestApp` main: current modular reference/product repository. Its tree contains dedicated Admin, Business, Maps, Social cores plus account/action infrastructure. fileciteturn231file0L2-L2
- `matthagersenior/Kleenest_App` main: newer architecture/runtime source. Its development log and service tree explicitly contain contests, intelligence, notification, QR/check-in, rewards, discovery, fleet, and cross-surface wiring work. fileciteturn247file0L2-L2
- `matthagersenior/Kleenest` main: historical product source/documentation. Its product description explicitly includes premium navigation, reviews/photos, points/badges/leaderboards, business ads, QR/K-sticker visibility boosts, subscriptions, and promotions. fileciteturn241file0L2-L10
- Production Supabase: live RPC/table inventory.

## Hidden capability clusters discovered

### Consumer progression

Contests are a complete cross-surface lifecycle, not just a rewards feature: business publishes/manages contests → consumers join and submit entries → rewards accumulate → business analytics reads the same lifecycle. The newer repository has `contests.js`, `ContestsPage`, and Business Contest Analytics, while Supabase exposes contest tables and lifecycle RPCs. fileciteturn259file0L2-L10 fileciteturn260file0L2-L10

Architecture already has `src/domains/progression/contests.js`; therefore contests are **represented**, but require dependency/entitlement/event parity verification rather than another duplicate service. fileciteturn265file0L2-L10

### Monetization / access

The historical product source explicitly promises freemium/premium user access, business subscriptions, premium navigation, paid reviews/photos, QR promotions, and map visibility. fileciteturn241file0L2-L10

Production exposes `subscription_plans`, `subscriptions`, `pricing_family_catalog_v1`, `user_subscription_summary`, `family_has_premium_access`, product-access functions, preferred-location eligibility/usage, single-use access, and promotion redemption. These must be treated as one monetization/entitlement graph rather than independent feature flags.

### Advertising / promotion

Production contains `ad_placements`, `business_search_boosts`, promotions, QR, campaigns, engagement attribution, and promotion redemption. The historical product source also explicitly describes business ad features and visibility boosts. This is a missing Architecture-level business growth capability cluster even if some lower-level Business management exists.

### Media

Production exposes business media, location photos, review photos, featured location photos, media analytics/detail, and photo submission. The historical product source explicitly calls out photo uploads. This needs a canonical media/storage boundary so image records, storage objects, featured images, reviews, and business media do not develop separate ownership models.

### Business growth / lifecycle

Production contains business campaigns, contests, events, promotions, QR, partner programs, partnerships, search boosts, geofences, engagement attribution, growth signals, preferred-location analytics, ROI analytics, and visitor/occupancy analytics. The current Architecture business domain only exposes a management boundary. This is insufficient to represent the full business growth product surface.

### Location claims / map operations

Production has `location_claims`, `claim_location_for_business`, `claim_map_discovery_cell`, route-discovery cells/sessions/locations, and location address backfills. Maps and Business therefore share a claim/discovery infrastructure layer that must be represented explicitly rather than being buried in either domain.

### Intelligence execution

Production has intelligence action links, executable/complete actions, notification jobs, action job processing, public restroom intelligence, location intelligence snapshots, and publishing. The newer repository explicitly has intelligence actions and runtime surfaces. This is an execution platform, not merely a read-only analytics service.

### Notifications / network

Production contains notification events, deliveries, preferences, push subscriptions/deliveries, nearby recipient resolution, geofence notification creation, intelligence notification materialization, and fleet route notification publishing. The architecture must preserve the event → materialization → delivery → action chain.

## Hidden-feature matrix additions

| Capability | GitHub evidence | Supabase evidence | Architecture status |
|---|---|---|---|
| Contests | `contests.js`, contest pages, lifecycle logs | contests + join/entry/score/analytics RPCs | **represented; audit dependencies** |
| Premium/subscriptions | historical product spec + entitlement surfaces | subscriptions/pricing/product-access RPCs | **represented across access/entitlements; audit graph** |
| Family premium | family capability surfaces | family groups/accounts/invites + premium RPC | **represented; verify entitlement inheritance** |
| Ads/search boosts | historical ad/business description | `ad_placements`, `business_search_boosts` | **missing explicit domain** |
| Promotions | QR/business promotion flows | promotion tables + create/update/redeem/analytics RPCs | **missing explicit domain boundary** |
| Media/photos | historical photo feature + current location/review/business media surfaces | media/photo tables + RPCs | **missing explicit canonical media boundary** |
| Business events | current business lifecycle work | business event tables/RPCs/analytics | **partially represented** |
| Location claims | maps/business capabilities | claim RPCs + `location_claims` | **missing explicit boundary** |
| Route discovery cache | maps/routing work | discovery cells/sessions/locations/cache RPCs | **partially represented; verify ownership** |
| Intelligence execution | intelligence actions/runtime | action links/actions/jobs/publish RPCs | **represented; needs execution dependency audit** |
| Admin/data integrity | Admin core + admin pages | admin gateway/auth/data integrity/overview/report RPCs | **privileged boundary; audit separately** |

## New architectural rules

1. A historical product feature is not automatically a current requirement, but it is a **parity candidate** until explicitly classified legacy/excluded.
2. A Supabase capability without a GitHub consumer is not automatically dead code; classify it as infrastructure, admin, worker, future product, or orphan.
3. A GitHub service with a Supabase RPC is not automatically complete; verify entitlement, RLS, trigger effects, realtime/offline behavior, and UI termination.
4. Monetization must have one entitlement authority spanning user, family, business, enterprise, preferred-location, promotion, and single-use access.
5. Media must have one ownership/storage/record authority across location, review, and business contexts.
6. Business growth must distinguish authoritative commercial state from derived analytics.
7. Contest participation must remain connected to progression/rewards without manually double-recording activity events.

## Gate

**NOT READY TO WIRE.**

The hidden-feature audit materially expands the architecture work. The next large batch should audit the monetization/access graph, media/storage graph, business growth graph, and location-claim/discovery graph against actual RPC definitions, RLS, triggers, and existing Architecture contracts.
