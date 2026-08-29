# Trust / Route / Evidence Convergence — 2026-08-29

## Completed slice

The repository now has explicit regression gates for the next consumer convergence boundary:

`canonical location → verified visit → evidence → route-stop completion → trust/freshness refresh → review/progression → visible location state`

## Verified architecture

- Location details reads canonical location identity and includes trust/freshness state in its authoritative read path.
- Evidence submission remains server-authoritative and, when a qualifying check-in and route stop exist, attempts canonical route-stop completion.
- Successful evidence refreshes location trust and publishes the established consumer lifecycle signals.
- VisitSurface carries route/route-stop context into check-in settlement and uses the canonical routing/evidence/review services.
- Routing validates persisted route stops against canonical `locations` before persistence and uses authoritative route RPCs for arrival/completion.
- Freshness/confidence/reverification is represented by the canonical `location_confidence` state and authenticated RPCs; anonymous callers cannot refresh or select reverification targets.

## Regression gates

- `audit:freshness-confidence`
- `audit:route-evidence-convergence`

Both are now part of the canonical audit runner and `npm audit` chain before the build.

## Security boundary

Trust refresh is not client-authoritative. Evidence and route completion remain authoritative RPC operations, and browser lifecycle events are refresh/notification signals only.

## Remaining runtime certification

Static convergence is not production certification. A real authenticated journey still needs to prove the complete mutation/result sequence on the deployed application, including progression/reward settlement and visible downstream refresh.
