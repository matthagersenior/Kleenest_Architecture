# 2026-08-26 Three-Surface Concurrency Batch

## Decision
Web is a first-class product surface and is developed concurrently with Consumer Mobile and Business Mobile.

## Verified repository state
- `apps/consumer-mobile` exists as the native Consumer product.
- `apps/business-mobile` exists as the optional native Business companion.
- `src/runtime` contains the canonical web runtime.
- Business web already contains real operational surfaces including management, analytics, intelligence and engagement.
- Business Mobile must not become a prerequisite for core business operations.

## Required cross-surface contract
`capability → canonical data/RPC → authorization/entitlement → domain service → state/context → route → visible control → real query/mutation → resulting fact → UI refresh → downstream event/notification/analytics → automated verification`

## Current gap identified
Business Mobile has entry surfaces for Locations and Analytics, but the Locations screen is currently informational rather than fully operational. The Business web management surface is substantially more complete and already terminates real location, QR, campaign, promotion, event and contest operations through canonical services.

## Implementation response
1. Make the three-surface contract a repository-level rule.
2. Add CI that verifies the three surfaces exist and prevents Business web from depending on the Business Mobile application.
3. Continue vertical-slice implementation so each Business capability is closed on Web first/alongside Mobile, while keeping Mobile optional for core workflows.
4. Do not fabricate mobile mutations where the shared canonical service contract is not yet exposed; add the shared service contract first, then wire both surfaces.

## Next vertical slices
- Business location health and operational actions.
- QR management and consumer redemption.
- Promotions/campaigns/events and downstream attribution.
- Business intelligence recommendation → action → resulting metric.
- Consumer web parity for map/location/check-in/QR/rewards/notifications.

## Release gate
A capability is incomplete until every required surface has a reachable, authorized, real UI action terminating in the canonical operation and resulting state. A Business capability is never release-blocked on installing Business Mobile if Web can perform the core operation.
