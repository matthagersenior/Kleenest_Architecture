# Kleenest

Canonical reconstruction and forward source of Kleenest from the Production Supabase capability contract and verified product behavior.

## Source of truth

- **Kleenest_Architecture is the canonical source repository and the product being built forward.** Runtime source, domain services, capability contracts, UI surfaces, infrastructure, documentation, and verification live here.
- **Supabase Production** is the backend capability authority.
- **Kleenest_App** is a legacy/reference consumer: useful for discovering proven UI and behavior, but not authoritative over architecture or future implementation.
- New architecture and implementation work belongs here. Do not add new product implementation to Kleenest_App during the reconstruction/build phase.

## Product UX standard — membership-specific, not JSON-driven

Kleenest is not complete when a backend capability merely exists. Every membership/workspace must present its capabilities through a polished, professional, visually coherent product UI that a normal operator can understand without reading or editing JSON.

The UX architecture is intentionally workspace-specific:

- **Consumer:** bright, intuitive, engaging discovery centered on Maps, places, check-ins, cleanliness evidence, reviews, rewards, community, and navigation.
- **Business:** operational dashboard centered on locations, listings, amenities, QR, campaigns, events, promotions, customers/engagement, analytics, and billing.
- **Fleet:** operational workspace centered on vehicles, drivers, routes, service opportunities, maintenance, alerts, metrics, scorecards, and operational outcomes.
- **Enterprise:** network workspace centered on partner organizations, locations/networks, campaigns, allocations, outcomes, metrics, benchmarks, and governance.
- **Admin:** governance/operations workspace centered on users, businesses, content, moderation, support, configuration, notifications, analytics, and system health.
- **Owner:** platform-control workspace with **Platform CRUD as a first-class, highlighted capability**. Owner navigation must make platform entities, configuration, entitlements, memberships, businesses, locations, campaigns, feature catalog, system controls, and audit/governance actions immediately understandable.

The membership workspaces should share a design system and navigation grammar without becoming one generic dashboard. Each role should see the information hierarchy appropriate to its responsibilities. Advanced controls may expose structured forms, tables, filters, drawers, wizards, and confirmation flows; JSON is an implementation/data representation, **not the operator interface**.

### Owner UI priority

The current Owner UI is considered a material UX defect. It must be reorganized rather than cosmetically patched. Platform-level CRUD must be visible as a core navigation/landing capability, with clear entity groupings, search/filtering, create/edit/delete actions, validation, authorization feedback, audit context, and safe destructive-action confirmation. Owner controls must not be scattered across unrelated technical panels.

## Operating rules

1. Every user-visible action terminates in a real capability.
2. One canonical implementation per capability.
3. Authorization and entitlements are explicit parts of capability contracts.
4. Protected writes use the backend authority/RPC or Edge Function rather than arbitrary direct table mutation.
5. UI surfaces consume domain capabilities; they do not become capability owners.
6. **Every backend capability intended for an operator gets a human-usable UI termination; no JSON-only operational workflows.**
7. Maps/location intelligence is foundational.
8. Duplicate implementations are catalogued before being removed.
9. Large batches are safe only when each batch is independently auditable.
10. Server triggers, projections, workers and reward paths are part of capability correctness.
11. Production is not the test harness.
12. The source repository is built forward in place; architecture and implementation are not separated into different repositories.
13. Reference behavior may be imported from Kleenest_App, but canonical ownership moves to this repository once implemented here.
14. UX correctness is part of interoperability: `backend contract → authorization → service → AppContext → route → control → mutation/query → refresh → telemetry` must be traceable.
15. **Owner membership preview is presentation virtualization, not identity impersonation.** The authenticated owner remains the real actor; preview state changes the rendered membership/workspace presentation without changing production membership.
16. **Gamification is trust-first.** Games reinforce evidence literacy and useful restroom contribution; they do not replace real check-ins, observations, reviews, or reputation authority.

## Architecture, interoperability, and UX correctness status

The ownership/dependency audit is recorded in `docs/audits/batch-ao-full-architecture-audit.md`, with later resolutions reconciled in `docs/audits/batch-ao-blocker-status-reconciliation.md`. The current end-to-end interoperability audit is `docs/audits/20260824-end-to-end-interoperability-matrix.md`.

The current audit standard explicitly includes:

- Supabase capability/schema/RPC/RLS/grant correctness.
- Domain-service and AppContext wiring.
- Route/surface/control reachability.
- Real button/action termination.
- Telemetry and hidden metrics activation.
- Offline/realtime interoperability.
- Membership-specific information architecture and visual UX.
- Platform Owner CRUD discoverability and usability.
- Elimination of JSON-dependent operator workflows.
- Membership virtualization across Owner preview navigation.
- Game-to-progression and multiplayer challenge interoperability.

## Build order

1. Canonical architecture and capability contracts — established and continuously reconciled.
2. Canonical runtime and infrastructure — active source.
3. **Workspace design system and navigation architecture — Consumer, Business, Fleet, Enterprise, Admin, Owner.**
4. Maps/location/routing foundation.
5. Consumer evidence loop: discovery → check-in → observation → review → reputation → intelligence → community.
6. **Trust-first engagement loop: evidence literacy games → progression → social challenges → better contributions.**
7. Business growth loop: managed location → QR/geofence → campaign/event/promotion → engagement → redemption → attribution/ROI.
8. Fleet operations: vehicle/driver/route → service opportunity → operational event → metric → scorecard → outcome.
9. Enterprise network/allocation/outcome workflows.
10. **Owner Platform CRUD and governance workspace — highlighted core functionality, not an afterthought.**
11. Admin / intelligence / notifications / analytics.
12. Offline replay and realtime against the same authoritative commands.
13. Duplicate retirement, visual QA, capability coverage verification, and end-to-end verification.
14. Production promotion only after verification.

## 2026-08-24 mass implementation status

The current production batches closed concrete user-visible wiring gaps and expanded the product surface:

- **Maps:** successful GPS acquisition now drives external nearby discovery first, then the canonical Supabase nearby read. Bootstrap discovery follows the same GPS-first path. Permission denial is surfaced instead of silently presenting the St. Louis default as if it were the user's area.
- **Routes:** `publish_live_network_event` is a security-definer authenticated publication contract so route lifecycle actions can insert through the protected `live_network_events` boundary without weakening table RLS. Route geometry, distance, duration, GeoJSON and turn-by-turn steps are surfaced by the routing service.
- **Play:** the progression service implements the methods consumed by `ProgressionPage`.
- **Bathroom Trust Game Center:** `/games` now exposes twelve named, working mini-games covering cleanliness evidence, amenities, accessibility, review quality, verification, routing, and trust decisions. All solo scores terminate at the authoritative `record_game_result` progression RPC.
- **Multiplayer:** authenticated followers/following can challenge each other through the protected `game_challenges` contract. Challenges support pending/accepted/declined/completed/expired states, 48-hour expiry, scoring, winner/tie calculation, progression rewards, and notifications.
- **Owner membership virtualization:** Owner Tier Preview now persists a selected presentation tier across HashRouter navigation, renders the corresponding Consumer/Business/Fleet/Enterprise experience, and provides an explicit exit-preview control. The actual owner identity and production authorization remain unchanged.
- **Workspace UI:** Consumer, Business, Fleet, Enterprise, and Owner Control expose membership-aware quick actions; Owner Control explicitly highlights **Platform CRUD**.
- **Privacy:** the active public live-network delay is **1 hour**.
- **Security:** Enterprise network metric/outcome writes enforce owner/admin + Fleet/Enterprise boundaries; route activity functions derive the actor from `auth.uid()` or require authentication. Several legacy execute grants remain queued because the platform safety layer prevents direct privilege closure.
- **Deployment:** stale static route artifacts were removed so Pages resolves the canonical SPA runtime rather than old route-specific HTML.

## UX implementation requirements

Each workspace batch must include, where applicable:

- clear role-specific navigation;
- bright, professional visual hierarchy;
- responsive dashboard/cards/table/detail layouts;
- consistent terminology and iconography;
- human-readable empty/loading/error/success states;
- contextual primary actions;
- search/filter/sort for operational data;
- forms/wizards instead of raw JSON editing;
- authorization-aware controls;
- safe destructive actions and confirmation;
- authoritative post-mutation refresh;
- visible activity/audit context where appropriate;
- telemetry for meaningful user actions;
- accessibility and keyboard/touch usability;
- mobile-friendly behavior where the workspace is intended for mobile use.

See `docs/capability-inventory.md`, `docs/consumer-parity-matrix.md`, `docs/architecture/interoperability-dependency-matrix.md`, `docs/audits/20260824-end-to-end-interoperability-matrix.md`, `docs/audits/20260824-mass-implementation-batch.md`, `docs/audits/20260824-membership-preview-and-trust-games-batch.md`, and the audit files under `docs/audits/`.

<!-- Pages rebuild trigger: 2026-08-24 -->
