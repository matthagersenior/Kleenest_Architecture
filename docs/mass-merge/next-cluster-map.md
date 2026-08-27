# Next cluster map — front-to-back implementation slices

The canonical source is `Kleenest_Architecture:main`. Work is grouped by complete product slice, not by file or layer. A slice lands its Supabase authority, authorization, service, AppContext, route/surface, controls, refresh/realtime, telemetry, and offline behavior together where applicable.

## Slice 0 — Governance / authority repair

- Reconcile Production migration history with repository migrations.
- Replace the six-domain-contract raw audit denominator with the classified capability/function inventory.
- Classify every privileged/internal/legacy function; require zero unexplained public functions.
- Preserve the closed anonymous execute boundary for privileged SECURITY DEFINER RPCs.

## Slice 1 — Consumer evidence loop

`GPS/QR check-in → observation → amenity/bathroom evidence → photo → review → vote → reputation/milestone → notification`

## Slice 2 — Maps + routing outcome loop

`GPS → universal discovery → canonical map → multi-stop draft → rich snapshots → publish/complete → navigation → route event → telemetry`

## Slice 3 — Trust-first progression/social loop

`evidence/check-in/review → game/challenge/quest → progression → badge/level/reputation → leaderboard → notification`

## Slice 4 — Business growth loop

`managed location → QR/geofence → campaign/event/promotion → engagement/redemption → attribution → analytics/ROI → notification`

## Slice 5 — Fleet operations loop

`vehicle/driver → route/geofence → operational event → service opportunity → metric → safety/maintenance score → notification → fleet console`

## Slice 6 — Enterprise network loop

`partner/network → member/location allocation → campaign/contest → engagement/QR → outcome → benchmark/ROI → governance`

## Slice 7 — Access / commerce outcome loop

`pricing/entitlement → offer → purchase → redemption → attribution → reward/outcome telemetry`

Commerce remains a Stripe boundary when implemented; Supabase pricing data alone is not commerce completion.

## Slice 8 — Intelligence + notification convergence

`domain event → intelligence job/action → notification materialization → delivery → actionable deep link → read state → analytics`

Unify consumer, business, fleet, enterprise, and live-network producers onto the same authoritative notification path.

## Slice 9 — Offline / realtime convergence

All preceding slices must use the same command/event semantics online and offline. Replay must be idempotent and attributable, and must trigger the same authoritative refresh/realtime propagation as an online mutation.

## Acceptance gate

A slice is complete only when:

1. The canonical UI is reachable.
2. No duplicate runtime/service owns the capability.
3. Backend authority is explicit.
4. Authorization and entitlement are verified.
5. The action is real rather than mock/demo state.
6. Dependent UI refreshes from authoritative state.
7. Meaningful telemetry is recorded.
8. Realtime/offline paths do not fork business logic.
9. Security/RLS/grants are verified.
10. The slice lands as one coherent implementation commit with an audit note.

See `docs/audits/20260826-interoperability-capability-exposure-audit.md` for the current capability/exposure matrix and evidence.
