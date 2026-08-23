# Merge Batch Manifest — 2026-08-23

## Purpose

This is the execution manifest for bulk migration from known Architecture commits, donor implementations, and Production Supabase capabilities. It is intentionally commit-oriented so proven work can be merged/reconciled in batches rather than rediscovered screen-by-screen.

## Authority order

1. Production Supabase — authoritative data, RPC, authorization and derived-state contracts.
2. `Kleenest_Architecture/main` — canonical implementation and runtime.
3. `Kleenest_App/main` — primary behavioral donor/reference.
4. `KleenestApp/main` — earlier donor/reference.
5. Other/legacy repositories — archaeology only.

## Merge rule

A donor commit/file is mergeable when its behavior can be mapped to an existing canonical Architecture service and Supabase authority. Prefer cherry-pick/port of the smallest proven behavior set, then reconcile imports, workspace boundaries, entitlements, realtime/offline handling and telemetry. Never merge duplicate services, direct client writes that bypass canonical RPCs, or donor-owned state models.

## Canonical completion chain

`producer -> canonical identity -> authoritative store/RPC -> authorization/entitlement -> Architecture service -> AppContext -> workspace consumer -> UI action -> realtime/offline -> resulting fact -> analytics/coverage`

## Batch groups

### A — Foundation / account

- Account context refresh after Business mutations: `71afff9`
- Effective business tier / entitlement reconciliation
- Capability registry and runtime service exposure
- Universal discovery and reputation runtime wiring

**Status:** merged/reconciled.

### B — Coverage / telemetry

- Capability coverage rollup
- `record_feature_access()` RPC
- `capabilityCoverage` service
- Activity-event bridge for feature access and location/business actions

**Status:** merged/reconciled.

### C — Consumer discovery / trust

- Universal discovery
- canonical location identity enforcement
- map/GPS/location detail
- evidence/quality observations
- verification/reputation/intelligence
- favorites/route intelligence

**Backend:** substantially present.
**Merge strategy:** wire missing consumer edges; do not create new evidence or discovery engines.

### D — QR / progression / engagement

- QR/check-in attribution
- rewards/progression
- Business QR engagement programs
- `qr_engagement_program_created` telemetry
- challenges/games/quests/contests/leaderboards

**Status:** mixed; backend-rich, consumer parity remains the merge target.

### E — Business OS

- locations/media/amenities
- promotions/redemption
- campaigns/events/contests
- partnerships/preferred locations/certifications/clubs/perks/search boosts
- attribution/ROI/intelligence

**Status:** backend-rich; merge known donor consumers into canonical Business services.

### F — Fleet OS

- vehicles/drivers/routes
- maintenance/alerts
- operational/performance events
- daily metrics/scorecards/snapshots
- route notifications
- service opportunities/intelligence

**Status:** operational chain substantially wired.
**Known genuine gap:** controller-authored metric definition/configuration adapter.

### G — Enterprise

- partner networks/memberships
- campaigns/allocations/outcomes
- campaign ROI/allocation ROI/network benchmark
- engagement metrics/intelligence
- Enterprise Fleet enablement

**Status:** backend-rich; merge analytics/workspace consumers.

### H — Notifications / realtime / offline

- notification events -> materialized notifications -> deliveries
- push subscription lifecycle
- Fleet route notification bridge
- intelligence notifications
- offline packs/queue/replay
- realtime invalidation/subscriptions

**Rule:** notification/realtime/offline are transport/read-model layers, never authorities.

### I — Data / admin

- external source catalog
- ingestion jobs and OSM ingestion
- public data search
- evidence/quality moderation
- admin CRUD/data integrity/maintenance
- feature/entitlement controls

**Rule:** privileged/worker boundaries stay server-side.

### J — Security gate

Known required remediation before promoting privileged capability to fully wired:

- `get_partner_network_benchmark()` owner-business authorization predicate.
- SECURITY DEFINER search-path hardening.
- explicit anon/authenticated/worker/admin execution classification.
- RLS policy coverage for tables currently lacking policies.
- leaked-password protection.

## Known commits already identified as useful merge anchors

| Commit | Use |
|---|---|
| `71afff9` | account context refresh after Business mutations |
| `4a3adae7` | universal discovery runtime exposure |
| `88675abc` | reputation runtime exposure |
| `91eaf64d` | capability registry/runtime reconciliation |
| `5679064c` | Fleet/partner/notification reconciliation baseline |

If a commit is already an ancestor of `main`, do not cherry-pick it again; use it as provenance evidence and merge only its still-missing descendant behavior.

## Known backend contracts that must be reused

- account/product entitlement resolution
- business/domain authorization
- feature catalog availability
- universal/location discovery
- route discovery
- evidence/quality observation submission
- verification/reputation
- Fleet operational/performance events
- Fleet dashboard/scorecard projections
- Enterprise partner analytics
- notification event/materialization/delivery
- offline canonical mutation replay
- external ingestion jobs

## Genuine new backend work

Do not create generalized replacement engines. The audit currently identifies only one recurring genuinely missing domain model:

`Fleet business -> controller -> metric definition -> goal/threshold -> scoring rule -> scope`

Implement this only as a thin Fleet configuration adapter over existing measurement/progression primitives.

## Batch acceptance gate

For every batch:

- production authority mapped;
- donor provenance recorded;
- canonical Architecture service identified;
- authorization/entitlement mapped;
- workspace consumer mapped;
- UI action mapped;
- realtime/offline path mapped;
- telemetry/value signal mapped;
- duplicate service/state ruled out;
- build/CI checked;
- Pages/runtime smoke checked where the batch affects UI.

## Current strategy

The audit is complete enough for **commit-oriented bulk migration**. Stop rediscovering capabilities individually. Search the donor and Architecture history for known behavior, map it to this manifest, and merge/reconcile whole capability clusters in dependency order.
