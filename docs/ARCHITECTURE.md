# Kleenest Architecture

## Authority
- `Kleenest_Architecture` is the canonical application architecture and deployment/test surface.
- `Kleenest_App` is the migration source until each capability is migrated and verified; it is not a competing runtime.
- Legacy `Kleenest`, `KleenestApp`, and refactor branches are reference-only.

## Runtime ownership
`main.jsx` → `CanonicalAppRuntime` → canonical page/workspace → domain services → single Supabase boundary.

Maps remain owned by `CanonicalAppRuntime → MapWorkspace/MapSurface`. No second map, shell, router, or runtime is permitted.

The runtime does not own business facts. Domain services own capability contracts; Supabase owns authoritative state, server-side authorization, projections, triggers, and worker execution.

## Canonical domain ownership

- **Identity:** authenticated actor/profile/session identity.
- **Entitlements:** account/product entitlement resolution and feature availability.
- **Locations:** canonical physical-place identity and shared location projections.
- **Location Quality:** observations, evidence, quality/review workflow, provenance.
- **Maps:** shared discovery and map retrieval/population.
- **Routing:** route plans/stops/events and generic route discovery.
- **Check-ins:** canonical arrival/check-in commands.
- **Reviews:** review lifecycle/read model.
- **Favorites:** user/location favorite state and route attribution.
- **QR:** scan/redemption attribution over the canonical check-in contract.
- **Progression/Rewards:** server-authoritative progression and reward consumption.
- **Business:** business lifecycle and commercial/growth capabilities.
- **Enterprise/Partners:** partner networks, allocations, outcomes, ROI and benchmarks.
- **Fleet:** operational state, telemetry, scorecards, snapshots and Fleet intelligence.
- **Fleet Business Config:** the one genuinely missing adapter for controller-authored metric definitions/goals/scoring/scope.
- **Intelligence:** derived recommendations and asynchronous action/notification jobs.
- **Live Network:** event/read-model delivery layer.
- **Notifications:** event materialization, delivery, read state and push/realtime infrastructure.
- **Analytics:** derived read models; never a shadow source of truth.
- **Offline:** cache/queue/replay infrastructure; never an independent authority.

## Shared identity boundaries

`locations.id` is the canonical physical-place identity. `places.id` must resolve through `places.location_id` before any capability requiring canonical location identity is invoked.

Route identity, user state, discovery-session state and entitlement state remain separate from the shared LocationContract.

## Entitlement / authorization order

`authenticated user`
→ `account/service entitlement`
→ `business/domain authorization`
→ `feature catalog capability`
→ `domain operation`

UI gating is only a presentation optimization. Server/RLS/RPC authorization is authoritative.

## Feature parity rule
Supabase production capabilities are the backend master checklist. Every capability moves through:
1. capability contract
2. canonical service
3. canonical UI surface
4. real action/button termination
5. auth/entitlement/identity enforcement
6. offline/retry behavior where applicable
7. downstream trigger/event/projection verification
8. CI/build verification

A capability is not marked complete because an RPC exists or a page exists; the complete path must work end-to-end.

## Authority rule

A canonical mutation occurs once. Database triggers/server commands own automatic projections, rewards, feature events and notifications unless a documented higher-level server contract explicitly owns them.

Client code must not reproduce:
- trigger-owned counters/ratings;
- server-generated reward points;
- canonical feature-event capture;
- notification materialization/delivery;
- authoritative operational projections.

## Packaging rule
Organize by domain and shared infrastructure. One implementation per capability. Shared primitives are imported; they are never copied into alternate pages/services.

## Deployment rule
The architecture repository must produce the Pages test build directly. Environment values are injected at build/deploy time; secrets are never committed.

## Migration rule
Existing working code is migrated into canonical ownership rather than rewritten into parallel versions. After a capability is migrated and verified, duplicate implementations are removed or explicitly quarantined as reference-only.

## Wiring gate

Architecture is ready for implementation, but broad UI wiring is gated on the backend correctness findings recorded in `docs/audits/batch-ao-full-architecture-audit.md`.

No Production mutation is considered an acceptable test harness. Backend authority fixes and end-to-end simulations must occur in an isolated development environment before promotion.
