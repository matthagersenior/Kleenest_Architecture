# Kleenest — Front-to-Back Interoperability Matrix & Large-Slice Program — 2026-08-29

## Baseline

The current application state is the strongest working baseline reached so far. Protect this state: future work is evaluated as an additive, contract-preserving expansion rather than a reason to destabilize working surfaces.

**Acceptance path**

`Supabase capability → database/RPC/RLS → canonical service → AppContext/runtime → navigation/surface → user action → authoritative mutation/query → refreshed read model → telemetry → downstream consumers → realtime/offline behavior`

A feature is **not wired** merely because a table, function, component, route, or catalog entry exists.

## Live authority snapshot

The production Supabase project currently exposes a broad operational substrate, including:

- 32 feature catalog records and 32 feature-contract mappings.
- 6 capability-domain contracts.
- 442 function classifications.
- 80 capability audit runs.
- 10,557 canonical locations.
- 11,067 external location records and 13,055 external observations.
- 10,000 location bathroom-intelligence records.
- 2,430 intelligence action links.
- 12,167 cross-feature data events.
- 99 intelligence notification jobs.
- QR, geofence, route-discovery, offline-pack, fleet, enterprise, progression, social, billing, reporting, notification, and external-ingestion substrates.
- Active Edge Functions covering map ingestion, public-data ingestion, intelligence, notifications, address backfill, billing, reporting, admin control, and bootstrap workflows.

This confirms the central audit hypothesis: **backend breadth is no longer the primary constraint; capability exposure, interoperability, authorization correctness, surface coverage, and end-to-end activation are.**

## Matrix legend

- **Wired** — end-to-end path is demonstrated and authoritative.
- **Partial** — meaningful implementation exists but one or more layers remain incomplete.
- **Hidden** — authoritative capability exists with insufficient product exposure.
- **Orphaned** — surface exists without a complete authoritative backend path.
- **Duplicate** — competing implementation/data model exists.
- **Legacy** — old path should be retired after callers are migrated.
- **Blocked** — capability is present but authorization/dependency/data state prevents use.
- **Missing** — required capability has no authoritative implementation.
- **Enhance** — working path has significant unused capability.

## Domain matrix

| Domain | Supabase substrate | Service/runtime | Primary surfaces | Current state | High-value hidden capability | Large-slice target |
|---|---|---|---|---|---|---|
| Maps / Location | locations, places, location_sources, external_location_records, external_observations, confidence, feature summaries, discovery caches/sessions | canonical location/discovery services | Home, Map, Search, Details | Partial/Wired foundation | provenance, freshness, source conflict resolution, richer OSM tags/address | **Location Authority Closure** |
| Address / External Data | external sources/datasets/import jobs, external records/observations, address backfill | ingestion/address services | Map, Search, Details, Admin | Wired substrate / Enhance | full OSM tag preservation, source comparison, field-level provenance | **Location Intelligence Foundation** |
| Amenities | amenities, location_amenities, amenity observations, fixture data, review feedback | location/amenity services | filters, cards, details, verification | Partial | richer amenity taxonomy, evidence/confidence, source-vs-observed distinction | **Location Authority Closure** |
| Trust / Evidence | visits, observations, bathroom verification, quality observations, conflicts, reputation | evidence/verification services | Verify, Details, Community | Partial/Wired foundation | confidence propagation, conflict resolution, reverification | **Trust Loop Closure** |
| Routing | route_plans, route_stops, route_events, discovery sessions/locations/cells, offline packs | route services | Plan, Route, Navigation, Fleet | Partial/Wired foundation | dynamic discovery, evidence-aware stops, recovery/offline convergence | **Route + Evidence Convergence** |
| Progression | points, badges, levels, streaks, progression events/actions/games/challenges | progression services | Progression, Community, Leaderboards | Partial | event fan-in, rewards, cross-domain achievements | **Engagement Graph** |
| Community | posts, comments, likes, saves, follows, activity, reports | community services | Social, profile, feeds | Partial | contribution → reputation → intelligence → moderation loop | **Trust + Community Closure** |
| Business | businesses, members, locations, campaigns, promotions, events, clubs, certifications | business services | Business workspace | Partial/Wired foundation | unified operator loop and cross-domain analytics | **Business Operating Loop** |
| QR / Engagement | qr_codes, QR programs, attribution, redemptions, QR intelligence | QR services | QR Studio, public QR landing | Partial/Wired foundation | branded QR, campaign attribution, review/check-in conversion, analytics | **Business Engagement Loop** |
| Geofence | business_geofences, geofence_events | geofence services | Business/Fleet/Intelligence | Partial | enter/exit/dwell/conversion → notification/QR/action | **Contextual Engagement** |
| Fleet | vehicles, drivers, routes, updates, performance, maintenance, scorecards, metrics | fleet services | Fleet command | Partial | operational metrics, dispatch lifecycle, route evidence, alerts | **Fleet Operations Closure** |
| Enterprise | networks, members, allocations, campaigns, outcomes, metrics, engagement/intelligence events | enterprise services | Enterprise command | Partial | network-wide allocation, partner performance, shared intelligence | **Enterprise Network OS** |
| Intelligence | action links, notification jobs/deliveries, intelligence events | intelligence services/Edge Functions | Business/Fleet/Enterprise/Owner | Partial/Wired substrate | recommendation → action → outcome loop | **Intelligence Action OS** |
| Notifications | notification events/deliveries/preferences/push subscriptions | notification services/Edge Functions | in-app, push | Partial | reliable event fan-out, dedupe, action links, delivery telemetry | **Realtime/Notification Closure** |
| Offline | offline packs, route-discovery snapshots/events | offline services | Route/Map/Fleet | Hidden/Partial | resilient route and location operation under network loss | **Offline Reliability** |
| Billing / Entitlements | pricing catalogs, subscriptions, Stripe records, feature entitlements | billing/membership services | membership, checkout, workspace gates | Partial | entitlement-driven capability activation and preview | **Entitlement Closure** |
| Admin / Owner | capability catalog, audit runs, classifications, retirement log, feedback/support/reporting | admin/owner services | Admin, Owner, Membership Preview | Partial | live capability graph, diagnostics, safe controls | **Control Plane Closure** |
| Governance / Moderation | reports, review reports/moderation actions, social reports | moderation services | Admin/Owner + public reporting | Partial | scalable queue, evidence-aware moderation, auditability | **Production Certification** |
| Reporting | reporting schedules/runs | reporting Edge Function/services | Business/Fleet/Enterprise/Owner | Partial | scheduled operational intelligence and delivery | **Intelligence Action OS** |
| AI | existing intelligence substrate + semantic search query model | future AI orchestration boundary | search, explanations, copilots | Hidden/Planned | natural language search, summarization, conflict assistance, operator copilots | **AI Augmentation Layer** |

## Cross-domain interoperability graph

### Core graph

`External sources → canonical location → address/tags/provenance → amenities/features → map/search/details → visit/check-in → evidence → confidence/reputation → progression/community → intelligence → notification/action → outcome`

### Business graph

`Business location → QR/geofence/campaign/promotion/event → scan/visit/check-in/redemption → attribution → analytics → intelligence recommendation → operator action → measurable outcome`

### Fleet graph

`Enterprise/business → fleet → vehicle/driver → dispatched route → locked stop order → route event → location evidence → operational metric → alert/intelligence → operator action`

### Enterprise graph

`Enterprise network → partner business → allocation/campaign → engagement event → attributed outcome → network metric → intelligence → allocation/action`

### Reliability graph

`canonical state → realtime notification → offline snapshot → local event → replay/idempotency → authoritative reconciliation → refreshed surface`

## Layer-by-layer audit checklist

### Layer 1 — Supabase capability

For every capability:

- identify table/view/function/Edge Function/storage/realtime substrate;
- identify whether it is authoritative or compatibility-only;
- identify dependencies and consumers;
- identify unused fields/configuration that can create product value;
- identify security/performance concerns.

### Layer 2 — Database authority

Verify:

- schema and relationships;
- RPC/function contract;
- RLS policies;
- grants/EXECUTE permissions;
- triggers/derived data;
- idempotency;
- provenance;
- freshness/confidence;
- migration reproducibility.

### Layer 3 — Canonical service

Verify:

- one service path per capability;
- no direct protected-table access from UI;
- no duplicate client implementation;
- error semantics;
- retry semantics;
- authorization/entitlement behavior;
- cache invalidation/state refresh.

### Layer 4 — Runtime/context

Verify:

- AppContext or domain context receives authoritative data;
- loading/error/empty states are distinct;
- workspace/account boundaries are preserved;
- preview mode does not mutate real entitlement state;
- mutations refresh all dependent state.

### Layer 5 — Surface

Verify:

- feature is discoverable;
- navigation is canonical;
- controls are styled and accessible;
- mobile behavior is equivalent to desktop semantics;
- details/cards/results use the same location/business identity;
- no plain fallback UI hides real capabilities.

### Layer 6 — Action

Verify:

- primary user action exists;
- action reaches canonical service;
- authoritative state changes;
- dependent surfaces update;
- telemetry is recorded;
- failure preserves good state and exposes actionable recovery.

### Layer 7 — Interoperability

Verify:

- downstream domains consume the authoritative event/read model;
- no duplicate derived state is created unnecessarily;
- notifications/intelligence/progression/analytics receive the event where intended;
- realtime/offline behavior is explicit.

## Hidden-capability hunt

The audit must specifically inspect **unused capability**, not only broken capability.

High-priority examples already visible in the live schema:

1. **Location source payloads** — retain complete external payloads and expose source-aware details without flattening away tags.
2. **Location confidence/freshness** — surface why a result is trusted, aging, stale, or due for reverification.
3. **Amenity observations** — distinguish external claims from community/business-confirmed observations.
4. **Geofence conversion events** — connect proximity/dwell to campaigns, notifications, QR, and measurable conversion.
5. **QR intelligence events** — connect scans/redemptions to engagement and downstream business intelligence.
6. **Offline packs/events** — make route/location experiences resilient and replay-safe.
7. **Network leaderboards** — expose measurable cross-tier participation where product-appropriate.
8. **Reporting schedules** — turn business/fleet/enterprise metrics into recurring operational reports.
9. **Action links** — ensure intelligence recommendations terminate in actual controls rather than static text.
10. **Quest route configuration** — connect progression quests to location/route/evidence journeys.
11. **Feature access events** — use denied/locked/redirected/error outcomes to identify hidden UX and entitlement gaps.
12. **Data feature events** — use the existing event graph to reduce duplicated analytics/event pipelines.

## Large-slice implementation program

### P0 — Slice A: Location Authority Closure

Unify:

- external OSM/Data.gov/source records;
- complete source payload/tag retention;
- address projections;
- canonical locations/places;
- source/provenance identity;
- amenity extraction;
- freshness/confidence;
- conflict detection/resolution;
- map/search/details identity.

**Exit:** one canonical location ID and provenance chain survives every consumer/business surface.

### P0 — Slice B: Trust Loop Closure

Unify:

`discover → arrive → verify → observe → photograph → review → reputation → progression → community → intelligence`

**Exit:** one contribution produces authoritative downstream state without duplicated client scoring.

### P0 — Slice C: Route + Evidence Convergence

Unify:

`destination → ordered waypoints → route → navigation → arrival → evidence → stop completion → route completion`

Consumer route order remains editable. Fleet-dispatched route order becomes immutable once dispatched.

**Exit:** refresh/auth/offline transitions preserve the same route and stop identities.

### P1 — Slice D: Freshness / Confidence / Reverification

Turn source age, evidence count, source quality, user reputation, and recent verification into explicit location intelligence.

**Exit:** the product explains trust and stale state rather than silently presenting all locations equally.

### P1 — Slice E: Business Engagement OS

Unify:

`location → QR/geofence → engagement → attribution → review/check-in/reward/promotion → analytics → intelligence → action → outcome`

Include comprehensive QR Studio with Kleenest Standard branding and tier-appropriate custom branding.

**Exit:** every engagement asset has a measurable lifecycle.

### P1 — Slice F: Intelligence Action OS

Standard lifecycle:

`signal → recommendation → provenance → authorization → accepted → executing → completed/failed → outcome → notification/analytics`

**Exit:** no “intelligence” card is considered complete unless it leads to a real action or an explicit non-action state.

### P1 — Slice G: Entitlement + Workspace Closure

Unify membership tier, feature catalog, feature contracts, service entitlements, workspace access, owner preview, and backend authorization.

**Exit:** preview, frontend gating, service authorization, and RLS agree.

### P1 — Slice H: Notifications / Realtime / Offline

Unify event fan-out, delivery, push, dedupe, offline capture, replay, reconciliation, and read-state.

**Exit:** network interruption does not duplicate or lose authoritative events.

### P2 — Slice I: Fleet + Enterprise Shared Intelligence

Consume shared canonical location/engagement/intelligence facts while preserving domain-specific permissions and read models.

**Exit:** no second metrics engine is introduced for data already represented authoritatively elsewhere.

### P2 — Slice J: AI Augmentation

Add AI only over authoritative context:

- natural-language location search;
- trust/evidence summaries;
- moderation assistance;
- source-conflict suggestions;
- business growth copilot;
- fleet operations copilot;
- enterprise network copilot.

**Exit:** AI produces explainable, bounded recommendations and never directly becomes authority over location, reputation, entitlement, or destructive moderation state.

### P2 — Slice K: Governance + Production Certification

Complete:

- moderation queues;
- audit trails;
- security/RLS review;
- capability reconciliation;
- end-to-end fixtures;
- production journey certification;
- CI contract checks;
- visual/surface audit.

## Batch strategy

Do not create one commit per symptom.

For each slice:

1. inventory all affected Supabase capabilities;
2. inventory all services and callers;
3. inventory every affected surface;
4. map dependencies;
5. implement backend contract changes first;
6. migrate canonical services;
7. wire runtime/context;
8. wire all surfaces together;
9. add telemetry and failure paths;
10. run architecture/static/CI audits;
11. deploy;
12. test the complete user journey;
13. record residual gaps in the matrix;
14. only then begin the next slice.

## Regression protection

The current working baseline must be treated as a protected checkpoint. Every large slice must explicitly verify:

- Maps still load and recover after refresh.
- Map selection can always be exited.
- Business icons/logos remain consistent across map/results/details.
- Routes distinguish destination from restroom waypoints.
- Consumer stop order remains editable.
- Fleet dispatched stop order remains locked.
- Platform-owner authorization remains functional.
- Business Enterprise exposes Business + Fleet + Enterprise preview contexts.
- QR Studio remains discoverable and functional.
- OSM/Overpass tags and address provenance are retained.
- Shared styling remains applied to buttons, links, results, tables, and admin/owner surfaces.
- No new direct protected-table access bypasses canonical services.

## Immediate execution order

**A → B → C → D → E → F → G → H → I → J → K**

The first three slices are the foundation. D/E/F turn that foundation into differentiated product value. G/H make the platform operationally reliable. I/J/K expand scale and intelligence without creating a second architecture.

## Definition of done

A capability moves to **Wired** only when the matrix can point to evidence for:

- Supabase authority;
- correct RLS/grants;
- canonical RPC/service;
- runtime/context wiring;
- discoverable surface;
- styled/actionable control;
- authoritative mutation/query;
- refreshed state;
- downstream interoperability;
- telemetry;
- realtime/offline semantics where applicable;
- error/recovery behavior;
- automated/static coverage;
- no duplicate authority.

This matrix is the working control document for the next large-slice implementation phase.
