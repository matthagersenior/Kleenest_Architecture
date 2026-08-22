# Interoperability, Dependency & Data Matrix

## Purpose

A capability is not complete because a wrapper exists. The complete path is:

`producer → canonical identity/data → consumers → backend contract → entitlement/authorization → UI action → realtime/offline behavior → resulting signals`

Production Supabase is the backend authority; `Kleenest_App` is behavioral evidence. The reference repository already contains an explicit interoperability matrix and cross-surface runtime design. fileciteturn153file0L2-L2

## Core shared-data graph

### Location identity — highest priority

`locations.id` is the canonical physical-place identity. `places.id` is a presentation/discovery identity that points to `places.location_id`.

Consumers that must converge on `locations.id`:
- Map/discovery
- Place detail
- Check-in
- Reviews
- Favorites
- Evidence/verification
- Routing/stops/events
- Business-managed locations
- Enterprise allocations
- Fleet routes/operations
- Intelligence
- Notifications/geofencing
- Offline packs

A place ID and location ID are not interchangeable. The current Architecture `normalizePlace()` needs an explicit identity contract before wiring.

### Route identity

`route_plans` / `route_stops` / `route_events` and `location_route_events` feed consumer routing, favorite-route intelligence, live network, fleet operations, enterprise analytics, and offline route packs. Route events must retain canonical `location_id` and `route_id`.

### Evidence identity

Visits, observations, amenities, restroom quality, verification, photos, and reviews enrich the same canonical location. The reference implementation connects location activity to data-feature events and Live Network events. fileciteturn178file0L2-L2

### User activity → progression

Check-ins, reviews, contest results, games, follows, observations and redemptions can produce progression/reward effects. Reward state remains server-generated. fileciteturn179file0L2-L2

### Intelligence → actions

`location intelligence → recommendation/action link → Business/Fleet/consumer action → authoritative mutation → event → refreshed intelligence`

The reference app already implements this loop: demand recommendations can create promotions, location attention can trigger verification, and high-activity recommendations route to Fleet Review. fileciteturn187file0L2-L2

### Live Network → Notifications

`Live Network event → intelligence/recipient resolution → notification → realtime inbox/push → action destination`

The reference app routes demand, operational-attention, high-activity, contest, and reward notifications into Business Intelligence, Fleet Review, and consumer progression. fileciteturn170file0L2-L2

### Offline → authoritative replay

Offline data is cache/queue state only. The reference offline layer caches locations/businesses and replays check-in, observation and arrival events into authoritative RPCs. fileciteturn191file0L2-L2

## Critical dependencies

| Producer | Depends on | Feeds | Risk |
|---|---|---|---|
| Discovery | canonical location identity | Map, Place, activity telemetry | High |
| Place | `places.location_id` | check-in, review, evidence, directions | High |
| Check-in | location + QR/GPS authority | rewards, evidence, review eligibility, live events | Critical |
| Review | verified check-in | reputation, rewards, business analytics, evidence | Critical |
| Evidence | canonical location + user | confidence, intelligence, reputation, business | Critical |
| Favorites | canonical location | route signals, intelligence | High |
| Routing | locations + route identity | live/fleet/offline | Critical |
| Intelligence | location/evidence/activity | notifications + business/fleet actions | Critical |
| Live Network | activity/intelligence/fleet | notifications + realtime | Critical |
| Notifications | events/intelligence | consumer/business/fleet | High |
| Progression | verified activity/results | profile/rewards/leaderboards | High |
| Business | locations + entitlements | campaigns/promotions/QR/intelligence | Critical |
| Enterprise | business/partner/location facts | allocations/ROI/fleet | High |
| Fleet | route/location/business facts | operational events/intelligence | High |
| Offline | canonical pack + authoritative replay | maps/evidence/routing/check-in | Critical |

## Missing capability clusters discovered from Production

Production currently exposes 357 public routines and 177 public tables/views. The existing Architecture inventory is therefore a domain map, not exhaustive implementation parity. fileciteturn210file0L2-L2

Explicitly classify/add contracts for:

- pricing/subscription summary and pricing catalogs
- preferred-location activation, usage and deactivation
- single-use access offers, purchase and redemption
- promotion redemption and reward synchronization
- gamification dashboard/activity/badges/streaks/games
- social posts/comments/likes/saves/reports/activity/challenge entries
- messaging and moderation/reports
- location ingestion/external data/catalog/search
- map discovery cache population/claim
- location visits/filter events/submissions/claims
- bathroom verification campaigns/targets/points
- intelligence action execution/link lifecycle/job processing
- notification preferences/push subscription management/delivery state
- account deletion/feedback/support
- business media, clubs/certifications/perks/search boosts/leaderboards and complete analytics
- preferred-location business analytics
- enterprise allocation lifecycle and engagement/outcome events
- fleet enablement and fleet-route notification lifecycle
- live reactions and event publishing authority

These are not all UI features; some are workers, ingestion, analytics, or privileged infrastructure.

## Conflicts discovered

### 1. Follow contract conflict — BLOCKER

Production exposes `follow_user(p_user_id)`, but its current function definition inserts into `user_follows`. The live Production schema query found `follows` but did not find `user_follows`. The reference app directly writes `follows`, while Architecture currently calls `follow_user()` for creation while reading/deleting `follows`. fileciteturn204file0L2-L2

**Decision:** do not wire follows yet. Backend authority must be repaired/verified. Never maintain two follow stores.

### 2. Favorite-store duplication — BLOCKER

Production contains both `favorites` and `location_favorites`. `kleenest_toggle_favorite()` uses `favorites`, while the current reference `favorites.js` uses `location_favorites`. Architecture's interaction service uses the RPC for mutation but `favorites` for state reads. fileciteturn199file0L2-L2

**Decision:** canonicalize on the store used by the authoritative RPC (`favorites`) unless Production confirms synchronization. Never read one store and mutate another.

### 3. Live-event mutation authority — REVIEW

Reference and Architecture currently directly insert `live_network_events`. This must be verified against RLS/trigger/security policy before treating it as a public mutation contract. fileciteturn182file0L2-L2

### 4. Enterprise engagement mutation authority — REVIEW

The reference bridge directly inserts `enterprise_engagement_events`, while Production also exposes dedicated enterprise metric/outcome RPCs. Determine which events are raw telemetry versus authoritative business outcomes. fileciteturn188file0L2-L2

### 5. Notification mutation duplication — REVIEW

The reference notification service uses `mark_notification_read()` for single notifications but directly updates `notifications.read_at` for mark-all. Mark-all needs an explicit backend contract or documented RLS-safe batch operation before wiring. fileciteturn166file0L2-L2

### 6. Review → verification event semantics — REVIEW

The reference event bridge maps `recordReviewSubmitted()` to `LOCATION_VERIFIED`. A review submission and location verification are different facts. Resolve this before Architecture adopts that mapping. fileciteturn181file0L2-L2

### 7. Place/location identity normalization — BLOCKER

Architecture `normalizePlace()` currently permits a place's own ID to become `location_id` when `places.location_id` is absent. The reference app explicitly resolves place IDs to canonical locations before review/verification mutations. fileciteturn192file0L2-L2

**Decision:** location resolution must be explicit and fail closed for capabilities requiring canonical location identity.

## Data opportunities

1. **Location trust score** — verification + observations + freshness + conflicts + reviews + external-source agreement.
2. **Demand/conversion funnel** — search → view → directions → arrival → check-in → review. The reference business performance aggregation already models these signals. fileciteturn196file0L2-L2
3. **Location quality trajectory** — observations/verification/rating/occupancy over time.
4. **Route opportunity model** — favorite-route events + route stops + demand + location quality.
5. **Business ROI** — engagement + promotion/QR attribution + redemptions + partner allocations + outcomes.
6. **Fleet opportunity model** — location intelligence + route events + vehicle/driver state + service opportunities.
7. **Contributor trust/reward loop** — verified activity → evidence quality → reputation → progression → rewards.
8. **Notification effectiveness** — event → delivery → read → action → conversion.
9. **Offline reliability** — queued age, replay success/failure, authoritative result, stale-pack state.

## Wiring gate additions

Before wiring any surface:

- no capability may read one identity/store and mutate another;
- every cross-domain event needs an owner and semantic type;
- every direct table mutation needs RLS/trigger/security evidence;
- every Architecture RPC must be checked for dependencies on tables/functions that actually exist in Production;
- every UI CTA needs a complete downstream chain;
- offline actions must replay into the same authoritative mutation as online actions;
- realtime is delivery, not source of truth;
- analytics consumes canonical facts rather than creating shadow facts.
