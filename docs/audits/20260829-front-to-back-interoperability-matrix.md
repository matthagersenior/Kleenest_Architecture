# Kleenest front-to-back interoperability matrix — 2026-08-29

This matrix classifies each canonical product slice as **E2E verified**, **externally blocked**, or **genuinely missing**. “E2E verified” here means the repository and live Supabase authority contracts are converged through the canonical service/runtime path and enforced by the architecture audit suite. Physical browser/device delivery is called out separately and is never inferred from static/build success.

| Slice | Status | Canonical chain | Remaining boundary |
| --- | --- | --- | --- |
| Governance / authority | E2E verified | runtime → domain/service → canonical RPC → RLS/grants → audit runner | Continue security classification review without reopening direct runtime table authority. |
| Location truth / discovery | E2E verified | discovery → canonical location authority bundle → trust/intelligence → map/detail refresh | External public-data freshness remains source-dependent. |
| Consumer trust / evidence | E2E verified | check-in/evidence/photo/review → authoritative persistence → trust/progression → refresh | Physical camera/GPS behavior remains device/browser dependent. |
| Maps / routing | E2E verified | discovery → canonical map → route draft/stop → arrival/evidence/completion → telemetry | External routing/map-provider availability remains environmental. |
| Progression / social | E2E verified | evidence/check-in/review/community action → progression/reputation/quest → leaderboard/refresh | None currently classified as a code gap. |
| Business operations | E2E verified | workspace authority → CRUD/QR/program mutation RPC → analytics/intelligence → business refresh | None currently classified as a code gap. |
| QR / engagement | E2E verified | QR asset/landing → attribution → check-in/redemption → engagement → analytics/intelligence | Physical QR-camera scan remains device dependent. |
| Fleet / enterprise | E2E verified | Fleet/Enterprise mutation → operational/outcome record → cross-workspace refresh → intelligence → operator-triggered operational loop → jobs/actions/notifications | Real fleet operational data quality remains deployment dependent. |
| Notifications / realtime / offline | E2E verified for application path; externally blocked for physical push certification | authoritative notification → realtime inbox → push queue/status; offline action → bounded idempotent replay → offline sync refresh | Physical push delivery cannot be certified until at least one browser push subscription exists. Live state at classification time: 0 subscriptions, 0 deliveries. |
| Access / commerce | E2E verified for free claim/redemption; intentionally blocked for priced single-use issuance | free offer → authoritative claim → telemetry → redemption → Business attribution; recurring plans → Stripe checkout | Priced single-use offers cannot be issued directly and require a future verified Stripe checkout path. Live state at classification time: 0 enabled offers, 0 enabled priced offers. |

## Current genuinely missing rows

None are currently classified as an unimplemented canonical architecture row after the Fleet Intelligence runtime execution closure. New findings must be added here before implementation rather than being hidden inside feature-specific code.

## External certification queue

1. Register at least one real browser push subscription, create an authoritative notification, verify queue insertion, Edge Function delivery, browser receipt, deep-link handling, read state, and delivery-status persistence.
2. Perform an authenticated offline action on a physical browser/device, reconnect, verify one idempotent authoritative replay, realtime/UI refresh, and no duplicate notification/outcome.
3. Before enabling a priced single-use access offer, implement Stripe-confirmed single-use checkout/webhook fulfillment and only then permit paid issuance.
4. Exercise camera/GPS/QR behavior on target Android/iOS browsers to certify permissions and physical sensor flows.

## Guardrail

The 2026-08-29 application state remains the protected baseline. A future change is not considered converged merely because a service or RPC exists: the runtime must have a reachable execution point, dependent state must refresh authoritatively, and the applicable architecture audit must enforce the chain.
