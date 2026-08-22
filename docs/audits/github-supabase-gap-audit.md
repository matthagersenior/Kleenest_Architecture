# GitHub ↔ Supabase capability gap audit

This audit is a hard gate before wiring the application. It compares the reference application's service surface against the live Production Supabase schema/RPC surface.

## Confirmed reference services

The reference repository contains services for activity, admin CRUD/data, auth, business/lifecycle/performance/reviews/campaigns, check-ins, community, contests, events, favorites, feature parity, fleet/enterprise, follows, GPS geofencing, intelligence and intelligence actions/notifications/publishing/recommendations, live network/reactions, location activity/bootstrap/evidence/intelligence/verification, map discovery/network, milestones, Nominatim, notification preferences/realtime/inbox, observations, offline packs, places, platform capabilities, product access, profile, progression, push notifications, QR, realtime network, reputation, reviews, rewards, route plans, and universal discovery. The repository service directory itself is the baseline inventory. fileciteturn140file0L2-L5

## Supabase capabilities discovered that must not be lost

Production exposes substantially more than the already-created Architecture services, including:

- preferred-location activation/eligibility/usage
- single-use access offers, purchases and redemption
- promotions and promotion redemption
- subscription summary / pricing / plans
- badges and gamification dashboard/activity
- contributor reputation and milestones
- location verification, bathroom verification and amenity observation
- location intelligence, occupancy, engagement metrics and favorite-route metrics
- external data/catalog/ingestion
- public data search
- intelligence actions, action links and job processing
- notification preferences, push subscription registration/removal, notification event materialization
- account deletion and feedback/support
- admin authorization/data-integrity/overview/report/business/user controls
- business media, QR, events, contests, campaigns, promotions, partnerships, preferred locations and analytics
- enterprise partner allocation/campaign lifecycle
- fleet enablement, route notifications and intelligence
- live network events
- map discovery cache and claim operations

## Important result

The previous architecture pass was **not yet complete**. The live Supabase inventory shows additional capabilities that would otherwise be discovered during wiring. This audit therefore changes the gate: no UI wiring begins until these remaining capabilities are classified as canonical, infrastructure-only, privileged/admin, legacy/unused, or intentionally excluded.

## Newly promoted Architecture capabilities

- `domains/access/product.js`
- `domains/progression/reputation.js`
- `domains/live/network.js`
- `domains/location-quality/verification.js`
- `domains/discovery/universal.js`

## Explicit caution

The reference app contains direct table writes for some capabilities (notably live events and notification preferences). Existence of a table does not prove that a direct client write is the intended long-term authority. Such writes remain marked for security/authority review rather than being blindly copied.

## Wiring gate

Before wiring:

1. finish the remaining GitHub service audit;
2. map every referenced RPC/table/Edge Function to an Architecture capability;
3. identify GitHub features with no Production backend authority;
4. identify Production capabilities with no GitHub consumer;
5. classify privileged/admin/worker functions separately;
6. produce a zero-unclassified capability matrix;
7. only then wire the application shell.
