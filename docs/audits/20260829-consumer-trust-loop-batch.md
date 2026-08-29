# Consumer Trust Loop Integration Batch — 2026-08-29

## Scope
Large-slice closure work for the consumer path from canonical location discovery through verified contribution, progression, community refresh, and intelligence/map continuity.

## Current architecture verified
- `LocationDetailsPage` resolves location identity through the canonical location service and refreshes on check-in, rewards, location activity, and departure events.
- `VisitSurface` requires verified visits for trusted reviews and sends observations through the canonical evidence service; check-in settlement also updates progression/analytics and route-stop arrival when applicable.
- `consumerEngagementBridge` defines the intended consumer event fan-out for check-in, evidence, review, games, challenges, and routes.
- `ActivitySurface` and `SocialPage` consume consumer lifecycle events and refresh their authoritative feeds/rankings.
- `AppContext` exposes the canonical `locationJourney`, progression, evidence, review, routing, live, notification, and intelligence services from one runtime service graph.
- Evidence progression is server-gated and idempotent; evidence remains separately recorded for intelligence/provenance.

## Gap found during this batch
The runtime has a consumer event bridge, but the highest-value contributor surfaces still contain some direct event emission instead of consistently using the bridge. That creates an interoperability risk: the intended fan-out contract exists, but individual producers can drift from it.

## Repair
Standardize the consumer lifecycle boundary around `consumerEngagementBridge` for the next implementation pass. The bridge remains notification/refresh orchestration only; Supabase/domain services remain authoritative. Do not make browser events authoritative state.

## Acceptance target
A successful consumer mutation must follow:

`canonical location -> authorized domain service -> authoritative mutation -> bridge event fan-out -> dependent surface refresh -> visible result`

and progression/rewards must remain server-authoritative and idempotent.

## Next slice
Continue with freshness/confidence/reverification and then route/evidence convergence. Do not add an LLM to the mutation path; AI will consume canonical read models and produce bounded recommendations/explanations only.
