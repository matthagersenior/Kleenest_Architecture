# Wave 4 — Business Event → Intelligence → Action Authority Bundle

Status: **Implemented; live RPC verified**

## Scope

Converge the Business intelligence read path so Business operational decisions consume one authoritative projection before recommendations, notifications, and action execution.

## Contract

`business/location/QR/campaign/attribution/outcome data → get_business_intelligence_authority_bundle → operational loop → action/notification → outcome → refreshed intelligence`

## Changes

- Added `get_business_intelligence_authority_bundle(uuid,timestamptz,timestamptz)`.
- Bundle includes entitlement, dashboard, location intelligence, growth actions, attribution, ROI, and persisted Business intelligence action links.
- Business intelligence `actionLinks()` now consumes the authority bundle instead of directly reading `intelligence_action_links` from the browser service.
- Operational Business loop now consumes the same authority bundle rather than a parallel dashboard-only projection.
- Anonymous execution is explicitly revoked; authenticated execution is granted.

## Production verification

The live Supabase function exists and reports:

- authenticated EXECUTE: `true`
- anonymous EXECUTE: `false`

The bundle retains backend authorization through the existing business service entitlement/owner boundary. Recommendations remain advisory; mutations continue through authoritative Business RPCs.

## Next wave

Continue the remaining Wave 4 closure: universal event/outcome propagation into intelligence, then notification delivery verification and action/task handoff. Preserve the protected Location Authority and Business growth-loop baselines.
