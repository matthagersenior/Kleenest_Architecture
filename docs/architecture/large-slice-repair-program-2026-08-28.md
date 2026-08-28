# Kleenest Architecture — Large-Slice Repair & Implementation Program — 2026-08-28

## Purpose

This document turns the existing interoperability matrices, audits, route inventories, wiring ledgers, product split, and current production state into one implementation program. The objective is to stop treating isolated defects as the backlog and instead repair complete user journeys, workspace operating loops, and cross-domain contracts in large slices.

## Governing mission

Kleenest is a location intelligence and participation platform whose value loop is:

`discover a place → understand trustworthy location facts → act/check in → contribute evidence/review → build reputation/rewards → improve canonical intelligence → expose useful recommendations → enable Business/Fleet/Enterprise outcomes`.

The platform-owner/admin layer governs the system; it must not become the normal user workflow for Business, Fleet, Enterprise, or Consumer operators.

## Non-negotiable acceptance path

`Production Supabase authority → auth/RLS → canonical service → AppContext/runtime → workspace navigation → route/surface → actionable control → authoritative mutation/query → state refresh → telemetry → offline/realtime behavior`.

A page, card, button, RPC, or service existing is not implementation.

## Whole-app findings that change the repair strategy

### 1. The app has substantial backend breadth but uneven user-facing termination

The current runtime contains Consumer, Business, Fleet, Enterprise, Owner/Admin, intelligence, progression, offline, notification, reporting, QR, and evidence surfaces. However, many routes terminate multiple concepts in the same page (for example Business promotions/campaigns/events/contests currently route into the Business management surface, and several Fleet/Enterprise reporting routes share reporting pages). This is a navigation/product-information problem as well as a wiring problem.

### 2. Route aliases are numerous and need canonicalization

There are aliases such as `/map` and `/discover`, `/interaction`, `/interactions`, `/visit`, and `/check-in`, multiple quest routes, multiple rewards/contest/leaderboard routes, and parallel Owner/Admin paths. Aliases can remain for compatibility, but users should encounter one canonical navigation path and one canonical surface per concept.

### 3. Capability presentation must stop being a static inventory

Capability Hub, Operational Capabilities, Membership Preview, workspace navigation, and capability gates must all derive from the same canonical registry/catalog/contract model. Raw RPC inventories must be separated from human-facing capabilities. Unknown/unclassified functions must never be presented as product features.

### 4. The six canonical Supabase capability contracts are a boundary layer, not the whole product

The current six contracts cover bathroom intelligence, consumer check-ins, consumer observations, consumer reviews, universal location discovery, and owner/admin CRUD. The 32 enabled feature-catalog records and broader domain services must be mapped into those boundaries or explicitly assigned additional canonical contracts after conflict review.

### 5. Versioned Edge Functions and RPC overloads are architectural work

Versioned ingestion families and overloaded Business/QR/verification functions must be classified by caller, auth, writes, behavior, and ownership before UI expansion. Do not delete old versions solely because they look duplicated.

### 6. Production data indicates activation is a major gap

Canonical contribution tables have little/no production activity despite mature backend contracts. The repair program therefore prioritizes complete user journeys and clear calls-to-action, not merely additional backend capability.

### 7. UI must be designed around user intent

Navigation should answer: Where am I? What can I do here? What matters now? What is the next action? What changed after I acted? Technical RPC names, raw JSON, implementation terminology, and giant capability inventories belong in Owner/Admin diagnostic surfaces only.

## Large implementation slices

### Slice A — Canonical application shell and navigation

**Goal:** make every workspace understandable and navigable before adding more features.

- Establish one canonical primary navigation model per workspace.
- Consumer: Home/Map, Discover/Route, Saved, Activity, Community, Play, Profile.
- Business: Overview, Locations, Growth/Engagement, QR, Intelligence, Analytics, Notifications, Reports.
- Fleet: Operations, Routes, Vehicles/Drivers, Maintenance, Safety, Performance, Intelligence, Opportunities.
- Enterprise: Overview, Networks/Partners, Operations, Intelligence, Performance, Reports.
- Owner/Admin: Command Center, Platform Data/CRUD, Capabilities, Intelligence, Reporting, Audit/Governance, Maintenance.
- Collapse technical duplicate routes into redirects/aliases.
- Ensure breadcrumbs/back behavior and workspace switching are predictable.
- Make mobile navigation prioritize primary tasks and move diagnostics/secondary controls into contextual menus.
- Replace generic tier hero content where it obscures the task at hand with concise workspace/task context.

**Acceptance:** every important route has one canonical destination, one clear primary action, and a visible way forward/back.

### Slice B — Consumer discovery → place → contribution loop

**Goal:** activate the core consumer value loop.

`GPS → discovery → map/list → place details → trust/intelligence → check-in → observation/photo → review → reputation/reward → Community`.

- Preserve `mapsurfacesv3` canonical map work.
- Verify GPS-first discovery and external-source propagation.
- Improve map/list/detail hierarchy and marker-to-detail continuity.
- Add clear Place actions: Navigate, Check In, Save, Add evidence, Review.
- Make verification/freshness/confidence understandable without exposing backend terminology.
- Ensure check-in authorization, observation, photo, review, reputation, and reward state refresh end-to-end.
- Add empty/loading/error/offline states that explain the next action.
- Ensure Community only receives safe published review content and contributor context.

### Slice C — Consumer engagement/progression/social

**Goal:** make participation rewarding and discoverable.

`verified behavior → points → streaks/badges → quests/challenges/games → contests → leaderboard/rewards → social reputation`.

- Complete Progression service/UI contract.
- Give Play one coherent home instead of separate technical routes.
- Make quest/challenge/game states actionable.
- Wire reward history and redemption feedback.
- Connect verified contribution outcomes to progression without client-authoritative scoring.
- Connect Community/Profile reputation to actual contribution history.
- Family/Premium/Fleet/Enterprise membership presentation must explain benefits without dead-end upgrade buttons.

### Slice D — Business operating/growth loop

**Goal:** make Business a true operator workspace rather than a collection of management pages.

`business identity → locations → map identity/assets → QR/geofence → campaign/promotion/event/contest → visitor engagement → review/reply → attribution → analytics → intelligence → recommended action → outcome`.

- Canonicalize Business location CRUD and overloaded RPCs.
- Separate Overview, Locations, Growth, Engagement, QR, Intelligence, Analytics, Notifications, Reports into coherent surfaces or tabs.
- Ensure every promotion/campaign/event/contest control has lifecycle state, validation, refresh, and feedback.
- Complete reviews/replies and customer engagement.
- QR Studio must own QR creation/customization/activation/archival/redemption/attribution analytics.
- Geofence and QR actions must flow into canonical check-in/engagement facts.
- Intelligence recommendations must terminate in actionable business controls.
- Replace raw diagnostics with operator-friendly forms, tables, status chips, and contextual actions.

### Slice E — Fleet operating loop

**Goal:** deliver an actual fleet command workflow.

`fleet authorization → vehicles/drivers/routes → operations → maintenance/alerts → safety/utilization → metrics/scorecards → intelligence/opportunity → notification → outcome`.

- Verify every Fleet RPC against Production signatures.
- Complete vehicle/driver/route CRUD with authorization and refresh.
- Route planning and route optimization must have one canonical flow and preserve map/route geometry.
- Maintenance, alerts, driver safety, telemetry, utilization, metrics, scorecards, goals, and opportunities must connect to the same operational facts.
- Intelligence recommendations must open the exact operational record/action that can resolve them.
- Fleet must not send operators into Owner/Admin technical controls for routine work.

### Slice F — Enterprise/network operating loop

**Goal:** make Enterprise more than a dashboard.

`network → partner → campaign/allocation → operational participation → outcome → benchmark/ROI → intelligence → action`.

- Complete network/partner CRUD and lifecycle.
- Connect enterprise campaigns to measurable outcomes.
- Surface network intelligence as actionable recommendations.
- Connect Enterprise fleet access without duplicating Fleet authority.
- Make reports/analytics scope-aware and tied to selected enterprise context.

### Slice G — Intelligence recommendation/action/outcome system

**Goal:** unify intelligence across Consumer, Business, Fleet, and Enterprise without creating a second source of truth.

- Canonical recommendation/action model.
- Evidence and provenance on recommendations.
- Authorization check before action execution.
- Action state: proposed → accepted → executing → completed/failed.
- Outcome measurement and attribution.
- Notifications generated from actionable state transitions.
- AI may rank/explain/suggest, but authoritative state remains Supabase/domain state.
- Each recommendation must deep-link to the relevant workspace record and actionable control.

### Slice H — Universal public-data ingestion and location identity

**Goal:** establish one canonical location pipeline.

`OSM/Data.gov/public source → source record → external identity → canonical location → dedupe/merge/conflict → freshness/confidence → discovery → downstream behavior`.

- Classify every ingestion Edge Function version.
- Establish one adapter/orchestration boundary.
- Preserve source provenance.
- Resolve identity conflicts deterministically.
- Surface freshness/confidence/explanation to users where useful.
- Never allow an external source to become a second location identity model.
- Backfill and scheduled jobs remain operational, not product UI capabilities.

### Slice I — Notifications, realtime, offline

**Goal:** make state changes dependable across network conditions.

- One canonical notification lifecycle: event → materialization → delivery → read/action.
- Actionable notifications deep-link to the exact current task.
- Realtime subscriptions restricted by privacy class and canonical event types.
- Offline packs are derived from canonical data and replay into canonical RPCs.
- Every offline mutation has idempotency, retry, pending, failure, and conflict semantics.
- Never mark unsupported offline events as synced.

### Slice J — Membership/entitlement product experience

**Goal:** make tier differences real, understandable, and consistent.

- Reconcile feature_catalog minimum tiers with product model and preview keys.
- Audit every membership button and lock state.
- Distinguish entitlement denial from auth/session/network/backend failure.
- Consumer tiers: Free, Premium, Family, Fleet User, Enterprise User.
- Business tiers: Business/Standard, Growth, Fleet, Enterprise.
- Ensure preview mode accurately demonstrates workspace navigation and feature availability.

### Slice K — Owner/Admin governance and CRUD

**Goal:** provide a real operator control plane.

- Platform CRUD as primary workflow: search/list → create/edit → validate → authorize → mutate → refresh → audit.
- Capability Hub as reconciliation/diagnostic tool, not product inventory.
- Operational Capabilities shows user-facing capabilities separately from supporting infrastructure.
- Audit/Governance surfaces conflicts, provenance, grants, lifecycle, and verification status.
- Maintenance/security controls remain restricted to owner/admin.
- No JSON-only workflow for ordinary CRUD.

### Slice L — Security, permissions, and production contract reconciliation

**Goal:** remove hidden correctness/security defects that can masquerade as UI problems.

- Inventory all active Edge Functions and versions.
- Verify `verify_jwt`, handler authorization, intended caller, tables/RPCs touched, and scheduling.
- Classify SECURITY DEFINER functions.
- Remove inappropriate public/anon grants.
- Reconcile RLS with intended workspace scope.
- Ensure UI errors do not falsely display entitlement locks.
- Verify webhooks and service-role functions remain non-browser capabilities.

### Slice M — Cross-workspace UI/interaction audit

**Goal:** make the product feel coherent.

For every workspace and major page:

- page purpose visible above the fold;
- primary action obvious;
- secondary actions grouped;
- filters/search contextual;
- list/detail transitions coherent;
- forms validate before submission;
- mutation feedback visible;
- successful mutations refresh the authoritative data;
- empty states explain what to do next;
- loading states preserve layout;
- errors identify whether retry, sign-in, upgrade, or support is appropriate;
- mobile layout remains usable;
- destructive actions confirm intent;
- technical details hidden unless useful;
- every link lands on the intended canonical route.

### Slice N — Production verification and regression hardening

- Run static UI interaction and route audits.
- Run build/CI.
- Verify deployed Pages behavior.
- Verify production Supabase contracts.
- Verify representative user journeys for every workspace.
- Compare current behavior with `Kleenest_App` only where it is a known reference for missing behavior; do not recreate legacy architecture.
- Update interoperability matrices and audit ledgers with resolved conflicts.
- Record accepted exceptions explicitly.

## Execution rule

Implement slices in dependency order, not by page count:

`A → B/C → D/E/F → G/H → I/J → K/L → M/N`.

Within each slice, batch similar files/services/RPC contracts together. Do not stop after fixing one button or one page when adjacent controls belong to the same contract.

If a conflict is discovered in the active slice, resolve the canonical boundary first. Do not build a parallel implementation to make the UI appear functional.

## Required reporting after each large slice

Report only:

1. slice completed;
2. major files/services/backend contracts changed;
3. canonical path established;
4. conflicts retired/rewired;
5. UI/navigation improvements;
6. verification performed;
7. remaining gaps that genuinely block the next slice;
8. commit SHA.

Do not call a capability implemented merely because its route renders.
