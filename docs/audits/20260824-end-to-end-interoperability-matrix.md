# End-to-end interoperability audit — 2026-08-24

## Scope

Sources reconciled in this pass:

- `Kleenest_Architecture/main`
- `Kleenest_App/main` legacy/reference implementation and route inventory
- Production Supabase project `Kleenest Production`
- Current Supabase schema, functions, RLS policies, grants, feature catalog, capability coverage rollup, and production row counts
- Current runtime services, route registration, button/action handlers, offline replay, live-network bridge, and capability telemetry
- Current mobile/browser behavior reported from the deployed Pages surface

The governing test is:

`Supabase fact/contract -> authorization/RLS -> domain service -> AppContext -> route/surface -> button/control -> authoritative mutation/query -> state refresh -> telemetry -> offline/realtime behavior`

## Immediate mass fixes completed

1. Community review publication delay is **1 hour** at the canonical community/public live-network boundary.
2. Community surface stopped consuming `live_network_events`; it now consumes the canonical published-review service with contributor reputation/provenance.
3. `fleet_metric_source_allowed(text,text)` is no longer executable by `anon` or `authenticated`; it remains an internal helper.
4. Capability-gate telemetry now uses the governed `capabilityCoverage` service instead of only the generic data-feature event stream.
5. Capability-gate feature codes were formalized in `feature_catalog` so access telemetry has a valid taxonomy.
6. Live-network publishing is now an authenticated production RPC contract backed by the existing `live_network_events` table.
7. Global live-network reads are restricted to delayed, non-presence event types; a security-definer public read RPC exposes only safe event fields and only events older than one hour.
8. The global network-event bridge was aligned with the actual subscription callback shape and restricted to the safe event set.
9. Offline replay was corrected to match Production RPC signatures, including check-in, restroom observation, route/live events, and Fleet operational events.
10. Unsupported offline event types now fail and remain pending instead of being silently marked synced.
11. Production Fleet operational-event replay contract was created against the actual Production table schema, which differs materially from the stale donor migration in the repo.
12. New runtime contracts were explicitly revoked from `public`/`anon` and granted only to `authenticated`.
13. Route/live publication was further hardened: `publish_live_network_event` is now `SECURITY DEFINER`, uses `auth.uid()` as the effective actor, has `authenticated` execute only, and is compatible with the route lifecycle service.
14. Map startup is now explicitly GPS-first: successful user coordinates trigger external nearby discovery before the canonical Supabase nearby read. Permission denial is surfaced instead of silently treating the St. Louis default as the user's location.
15. The universal discovery bootstrap now runs the same GPS-driven external discovery before the cached/universal discovery read.
16. `ProgressionPage`'s previously missing progression-service methods are now implemented against the existing authoritative gamification/progression RPCs and governed tables.
17. Workspace chrome now exposes membership-aware quick actions for Consumer, Business, Fleet, Enterprise, and Owner Control. Owner Control explicitly highlights Platform CRUD.

## Interoperability matrix

| Capability | Production authority | Runtime service | UI termination | Action/mutation | Telemetry | Offline/realtime | Status |
|---|---|---|---|---|---|---|---|
| Location discovery | `locations`, `places`, discovery RPCs + external ingest | maps + universalDiscovery | Map/Discover | GPS → external ingest → nearby/prepare | data-feature/discovery events | cache/live read | **GPS-driven wired** |
| Place details | location/intelligence facts | locations | Place | contribution/navigation actions | location/review events | partial | **wired/partial** |
| Check-in | `check_ins` + `create_check_in` | checkins/engagement | Visit/Check-in | `create_check_in` | check-in event | offline replay repaired | **wired** |
| Reviews | `reviews` + `create_review` | reviews/community | Place/Community | `create_review` | review event | offline replay requires canonical contract | **wired** |
| Community feed | `reviews` + reputation | community | Community | none | coverage/review telemetry | 1h publication delay | **fixed** |
| Reputation | `contributor_reputation` | reputation/progression | Community/Profile | server-authoritative | derived | backend/read-model | **partial** |
| Favorites | `favorites` / `location_favorites` | favorites/community | Map/Place | favorite RPC | favorite event | partial | **partial** |
| Routing | route plans/events + `live_network_events` | routing/live | Route | route request + lifecycle publication | route/live events | replay repaired | **RLS/publication fixed; routing geometry still partial** |
| Live network | `live_network_events` | live | Activity/bridge/Route | authenticated publish RPC | network event | safe delayed public read | **repaired/hardened** |
| Offline packs | offline pack tables | offline | Offline/Business | create pack | offline replay telemetry | IndexedDB + replay | **partial, replay repaired** |
| Business operations | businesses/assets/campaigns/events/promotions | business | Business Manage | canonical business RPCs | business action events | offline pack | **wired/partial** |
| Business intelligence | analytics/intelligence tables/RPCs | businessIntelligence | Business Intelligence | intelligence actions | capability/action coverage | partial | **partial** |
| Fleet operations | fleet vehicles/drivers/routes/alerts/etc. | fleet | Fleet Operations | status/maintenance/route RPCs | Fleet telemetry | offline operational replay repaired | **partial** |
| Fleet metrics | metric definitions/assignments/snapshots | fleetMetrics | Fleet Performance | create/update/assign RPCs | capability coverage | none | **partial** |
| Enterprise networks | enterprise network tables/RPCs | enterprise/partners | Enterprise | partner/campaign/outcome/metric actions | partial | none | **hardened/partial** |
| Entitlements | account/user entitlements + platform RPCs | platformEntitlements | CapabilityGate/workspaces | authorization | capability coverage | none | **wired/partial** |
| Capability telemetry | `feature_catalog`, `feature_access_events` | capabilityCoverage | CapabilityGate | `record_feature_access` | access outcome | none | **repaired** |
| General analytics | `data_feature_events` | analytics | cross-surface | event recording | event stream | none | **wired/partial** |
| Notifications | notifications/push/delivery tables | notifications/platformNotifications | Activity/Notification | read/send/publish | notification events | partial | **partial** |
| QR | QR/check-in/attribution tables | qr/qrAttribution | Business/Visit | QR creation/redemption | QR intelligence | partial | **partial** |
| Progression | points/badges/challenges/games/quests | progression/quests/reputation | Play/Profile/Community | progression RPCs + governed reads | progression metrics | partial | **service/UI wiring fixed; game-depth partial** |
| Workspace UX | membership/workspace model | AppContext + WorkspaceShell | all workspaces | quick actions/navigation | action telemetry where implemented | n/a | **navigation layer upgraded** |
| Owner Platform CRUD | admin CRUD gateway/schema | admin operations | Owner Control | governed CRUD actions | audit/capability telemetry | n/a | **highlighted; action-by-action audit continues** |

## Hidden capability/data findings

### 1. Feature catalog was ahead of actual access telemetry

Production has enabled features while the capability coverage rollup initially showed zero grants/access events. The runtime already had a capability-coverage service, but `CapabilityGate` was sending its access signal through the generic `data_feature_events` path instead of the governed `record_feature_access` path. The gate taxonomy also lacked feature-catalog entries for several gate kinds. This created a false appearance of an unused metrics system.

Fixed by formalizing the gate taxonomy and routing gate outcomes through `capabilityCoverage`.

### 2. Community had been reading the wrong dataset

The Community surface was reading `live_network_events`, while the canonical community service already had `listRecentReviews`. Production live-network rows included route/directions events. This was both semantically incorrect and a physical-presence/privacy risk.

Fixed by wiring Community directly to reviews and contributor reputation with a one-hour publication delay.

### 3. Live-network route publication had an RLS/security-mode mismatch

The route service was correctly calling the canonical publication RPC, but the active function executed as the invoker while the target table enforced authenticated actor ownership. The user-visible symptom was `new row violates row-level security policy for table "live_network_events"` during route actions.

Fixed in Production with `harden_live_network_route_publication`: the RPC is `SECURITY DEFINER`, uses `auth.uid()` as the effective actor, and is executable only by `authenticated`. Table RLS remains in force.

### 4. Map discovery was technically location-aware but operationally ingestion-lagged

The map already acquired GPS and queried nearby Supabase rows, but the external `ingest-map-candidates` path was only used as a fallback when existing data was empty. That meant a location with stale/partial ingested data could appear populated without triggering fresh user-location discovery.

Fixed by making startup explicitly GPS-first and running external nearby discovery before the canonical nearby read. This preserves the canonical location model while closing the missing propagation step: `user coordinates → external discovery → canonical locations → nearby query → markers`.

### 5. Play had a client/service contract mismatch

`ProgressionPage` called dashboard, summary, leaderboard, contest, challenge, badge, milestone, reward-history, contest-join, and badge-evaluation methods that were absent from `createProgressionService`. The page therefore had a reachable UI route but a dead service boundary.

Fixed by implementing those methods against existing Supabase RPCs and governed tables. No parallel progression authority was created.

### 6. Workspace UX was under-surfaced relative to backend capability

The domain model already contained role-specific navigation for Consumer, Business, Fleet, Enterprise, and Owner, but high-value actions were distributed across route pages and technical sections. This made the deployed product appear to have fewer features than the backend actually exposed.

Fixed at the workspace shell layer with membership-aware quick actions and an explicit Owner Platform CRUD entry. This is a navigation/termination improvement, not a replacement for action-level verification.

### 7. Owner Platform CRUD remains a product-level priority

The owner backend and CRUD gateway exist, but the definition of done is not satisfied by route reachability alone. Every entity resource still needs verified create/read/update/delete controls, validation, authorization feedback, refresh, and audit context. JSON may remain an advanced diagnostic representation but is not an acceptable operator workflow.

## Current production signals

- `locations`: 9,227
- `places`: 9,227
- `external_location_records`: 9,653
- `external_observations`: 3,003
- `data_feature_events`: 22,404
- `intelligence_action_links`: 252
- `live_network_events`: 11
- `feature_catalog`: 22 original enabled features before the new gate taxonomy
- `feature_access_events`: 0 before the telemetry repair
- Consumer contribution tables such as `reviews`, `check_ins`, `restroom_observations`, and `location_observations` currently have little/no production activity despite having complete backend contracts.

This means the next product problem is not primarily lack of backend capability. It is **activation, wiring, and verification of the contribution/intelligence loop**.

## Next bulk implementation order

### Batch 1 — Consumer evidence loop

`Map -> Place -> verified check-in -> observation -> review -> reputation -> intelligence -> Community`

Audit every button in these surfaces against the canonical RPC and verify the resulting fact appears in the next read model and telemetry stream.

### Batch 2 — Progression activation

`verified behavior -> points -> badges/streaks -> challenges/games/quests -> contests -> leaderboard/rewards`

The progression service contract is now repaired; next verify each game/quest/challenge action and activate any backend-only progression capability that is intended to be user-facing.

### Batch 3 — Business growth loop

`managed location -> QR/geofence -> campaign/promotion/event -> engagement -> redemption -> attribution -> ROI`

Use one canonical business identity and one canonical location identity throughout.

### Batch 4 — Fleet operational loop

`vehicle/driver/route -> service opportunity -> operational event -> metric -> scorecard -> notification -> outcome`

Reconcile all Fleet RPC signatures against Production before adding UI controls. Do not use donor migrations as a substitute for Production schema inspection.

### Batch 5 — Enterprise allocation loop

`network -> partner -> campaign -> allocation -> outcome -> metric -> ROI/benchmark`

Continue the owner/admin + Fleet/Enterprise authorization audit across every Enterprise read/write RPC.

### Batch 6 — Owner Platform CRUD completion

`Owner → resource catalog → list/search → create/edit → validation → authorization → mutation → refresh → audit`

Treat Platform CRUD as the primary Owner workflow, not a technical subpage.

### Batch 7 — Offline/realtime contract sweep

For every offline event type and realtime event type, require an explicit canonical producer, authoritative replay target, idempotency key, error state, and privacy class.

### Batch 8 — Security/grant reconciliation

Classify all SECURITY DEFINER functions as public-safe, authenticated-user-safe, business-scoped, Fleet/Enterprise-scoped, owner/admin, or worker-only. Remove grants that do not match the classification. Continue RLS policy reconciliation without adding broad policies merely to silence the advisor.

## Definition of done for each future batch

No capability is marked complete until all of these are proven:

1. Production table/RPC exists and its exact signature is known.
2. Authorization/RLS is correct for the intended caller.
3. Canonical domain service calls that contract.
4. AppContext exposes that service.
5. A reachable route/surface renders the capability.
6. Every actionable button has a real handler.
7. The handler reaches the authoritative mutation/query.
8. Success refreshes the authoritative read model.
9. Failure is visible and does not falsely advance state.
10. Telemetry is recorded in the intended analytics/coverage store.
11. Offline replay, if supported, targets the same authoritative contract.
12. Realtime, if supported, is explicitly scoped and privacy-classified.
13. The interoperability matrix is updated before the capability is called complete.
