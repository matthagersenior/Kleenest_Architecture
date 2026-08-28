# Kleenest

Canonical reconstruction and forward source of Kleenest from the Production Supabase capability contract and verified product behavior.

## Source of truth

- **Kleenest_Architecture is the canonical source repository and the product being built forward.** Runtime source, domain services, capability contracts, UI surfaces, infrastructure, documentation, and verification live here.
- **Supabase Production** is the backend capability authority.
- **Kleenest_App** is a legacy/reference consumer: useful for discovering proven UI and behavior, but not authoritative over architecture or future implementation.
- New architecture and implementation work belongs here.

## Product UX standard

Kleenest is not complete when a backend capability merely exists. Every membership/workspace must present its capabilities through a polished, professional, visually coherent product UI that a normal operator can understand without reading or editing JSON.

The UX architecture is workspace-specific:

- **Consumer:** discovery centered on Maps, places, check-ins, cleanliness evidence, reviews, rewards, community, and navigation.
- **Business:** operations centered on locations, listings, amenities, QR, campaigns, events, promotions, engagement, analytics, and billing.
- **Fleet:** vehicles, drivers, routes, service opportunities, maintenance, alerts, metrics, scorecards, and outcomes.
- **Enterprise:** partner organizations, locations/networks, campaigns, allocations, outcomes, metrics, benchmarks, and governance.
- **Admin:** users, businesses, content, moderation, support, configuration, notifications, analytics, and system health.
- **Owner:** platform-control workspace with **Platform CRUD as a first-class capability**.

Shared design-system grammar is intentional; a generic dashboard is not. Advanced controls should use human-readable forms, tables, filters, drawers, wizards, and confirmations rather than JSON-only workflows.

## Architecture operating rules

1. Every user-visible action terminates in a real capability.
2. One canonical implementation per capability.
3. Authorization and entitlements are explicit parts of capability contracts.
4. Protected writes use backend authority/RPC or Edge Function boundaries.
5. UI surfaces consume domain capabilities; they do not become capability owners.
6. Every operator capability gets a human-usable UI termination.
7. Maps/location intelligence is foundational.
8. Duplicate implementations are catalogued before retirement.
9. Large batches are independently auditable.
10. Server triggers, projections, workers and reward paths are part of capability correctness.
11. Production is not the test harness.
12. The source repository is built forward in place.
13. Reference behavior may be imported from `Kleenest_App`, but canonical ownership moves here once implemented.
14. UX correctness is part of interoperability: `backend contract → authorization → service → AppContext → route → control → mutation/query → refresh → telemetry` must be traceable.
15. Owner membership preview virtualizes presentation; it does not impersonate another identity.
16. Gamification is trust-first and never replaces authoritative check-ins, observations, reviews, or reputation.

## Current architecture and verification status

The current-state verification ledger is `docs/audits/current-architecture-verification-ledger.md`. Historical audits remain historical evidence and are not rewritten to match later refactors.

Current canonical runtime boundaries include:

- decomposed `CanonicalAppRuntime` with dedicated route modules;
- separated workspace definitions/access/navigation and navigation presentation;
- canonical route registry;
- separated intelligence actions, convergence, notification, and owner-intelligence services;
- dedicated Owner presentation-preview flow;
- JSX-aware UI interaction auditing.

The latest complete verification baseline established 107 routes across 5 route modules, 9 membership tiers / 31 capability domains, passing membership preview, UI interaction, interaction-destination, and intelligence-loop gates. A later canonical-architecture gate still requires reconciliation, so the branch is **not currently documented as fully production-verified**.

## Build order

1. Canonical architecture and capability contracts.
2. Canonical runtime and infrastructure.
3. Workspace design system and navigation architecture.
4. Maps/location/routing foundation.
5. Consumer evidence loop: discovery → check-in → observation → review → reputation → intelligence → community.
6. Trust-first engagement: evidence literacy → progression → social challenges → better contributions.
7. Business growth: managed location → QR/geofence → campaign/event/promotion → engagement → redemption → attribution/ROI.
8. Fleet operations: vehicle/driver/route → service opportunity → operational event → metric → scorecard → outcome.
9. Enterprise network/allocation/outcome workflows.
10. Owner Platform CRUD and governance.
11. Admin / intelligence / notifications / analytics.
12. Offline replay and realtime against the same authoritative commands.
13. Duplicate retirement, visual QA, coverage verification, end-to-end verification.
14. Production promotion only after verification.

## UX implementation requirements

Workspace batches should include role-specific navigation, responsive layouts, consistent terminology/iconography, human-readable loading/error/success states, contextual primary actions, search/filter/sort for operational data, forms instead of raw JSON editing, authorization-aware controls, safe destructive confirmation, authoritative refresh, activity/audit context where appropriate, telemetry, accessibility, and mobile usability where applicable.

## Documentation policy

Historical audit files are retained unchanged as evidence. Current implementation and verification status belongs in `docs/audits/current-architecture-verification-ledger.md`. A capability may only be called **VERIFIED** when the applicable automated verification has passed; implementation alone is **IMPLEMENTED**.

<!-- Pages rebuild trigger: 2026-08-28 -->
