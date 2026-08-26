# Kleenest

Canonical reconstruction and forward source of Kleenest from the Production Supabase capability contract and verified product behavior.

## Source of truth

- **Kleenest_Architecture is the canonical source repository and the product being built forward.** Runtime source, domain services, capability contracts, UI surfaces, infrastructure, documentation, and verification live here.
- **Supabase Production** is the backend capability authority.
- **Kleenest_App** is a legacy/reference consumer: useful for discovering proven UI and behavior, but not authoritative over architecture or future implementation.
- New architecture and implementation work belongs here.

## Product UX standard

Kleenest is not complete when a backend capability merely exists. Every membership/workspace must present its capabilities through a polished, professional, visually coherent product UI that a normal operator can understand without reading or editing JSON.

## Three concurrent product surfaces

Kleenest is built concurrently as:

- **Consumer Mobile:** native iOS/Android consumer experience.
- **Business Mobile:** optional native operational companion for businesses; no core Business workflow may require installation of this app.
- **Web:** first-class product surface for consumers and the primary full-featured Business workspace. Businesses must be able to operate entirely from the web.

Consumer users may choose the native app or web while retaining the same account, saved state, evidence, check-ins, rewards, quests, notifications, Family, Premium and other canonical state.

See `docs/architecture/three-surface-feature-contract.md` for the mandatory cross-surface feature contract.

## Membership UX

- **Consumer:** bright, intuitive, engaging discovery centered on Maps, places, check-ins, cleanliness evidence, reviews, rewards, community, and navigation.
- **Business:** operational dashboard centered on locations, listings, amenities, QR, campaigns, events, promotions, customers/engagement, analytics, and billing.
- **Fleet:** operational workspace centered on vehicles, drivers, routes, service opportunities, maintenance, alerts, metrics, scorecards, and operational outcomes.
- **Enterprise:** network workspace centered on partner organizations, locations/networks, campaigns, allocations, outcomes, metrics, benchmarks, and governance.
- **Admin:** governance/operations workspace centered on users, businesses, content, moderation, support, configuration, notifications, analytics, and system health.
- **Owner:** platform-control workspace with Platform CRUD as a first-class, highlighted capability.

## Operating rules

1. Every user-visible action terminates in a real capability.
2. One canonical implementation per capability.
3. Authorization and entitlements are explicit parts of capability contracts.
4. Protected writes use the backend authority/RPC or Edge Function rather than arbitrary direct table mutation.
5. UI surfaces consume domain capabilities; they do not become capability owners.
6. Every backend capability intended for an operator gets a human-usable UI termination; no JSON-only operational workflows.
7. Maps/location intelligence is foundational.
8. Duplicate implementations are catalogued before removal.
9. Large batches are safe only when each batch is independently auditable.
10. Server triggers, projections, workers and reward paths are part of capability correctness.
11. Production is not the test harness.
12. The source repository is built forward in place.
13. Reference behavior may be imported from Kleenest_App, but canonical ownership moves here once implemented.
14. UX correctness is part of interoperability: `backend contract → authorization → service → AppContext → route → control → mutation/query → refresh → telemetry` must be traceable.
15. Owner membership preview is presentation virtualization, not identity impersonation.
16. Gamification is trust-first.
17. **Web and both product apps are implemented concurrently. A feature is not complete when only one surface is wired.**
18. **Businesses must never be required to install Business Mobile for core Business operations.**

## Build order

1. Canonical architecture and capability contracts.
2. Canonical runtime and infrastructure.
3. Workspace design system and navigation architecture.
4. Maps/location/routing foundation.
5. Consumer evidence loop.
6. Trust-first engagement loop.
7. Business growth loop.
8. Fleet operations.
9. Enterprise network/allocation/outcome workflows.
10. Owner Platform CRUD and governance.
11. Admin / intelligence / notifications / analytics.
12. Offline replay and realtime.
13. Cross-surface parity, visual QA, capability coverage verification, and end-to-end verification.
14. Production promotion only after verification.

## Front-to-back definition of done

Every feature must trace:

`capability → canonical data/RPC → authorization/entitlement → domain service → state/context → route → visible control → real query/mutation → resulting fact → UI refresh → downstream event/notification/analytics → automated verification`

A placeholder, navigation-only button, mock result, client-fabricated fact, missing authorization, or missing resulting-state refresh is incomplete.
