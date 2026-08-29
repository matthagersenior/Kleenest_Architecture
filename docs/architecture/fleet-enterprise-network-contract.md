# Fleet / Enterprise / Network Intelligence Contract

This document is the implementation contract for the converged operational intelligence path.

## Canonical flow

1. Fleet reads business-scoped operational intelligence.
2. Fleet opportunities are recommendations, not authority.
3. Shared Intelligence Convergence provides the cross-workspace snapshot and live-event boundary.
4. Enterprise resolves the authenticated partner/network context.
5. Enterprise campaign/network mutations execute through authoritative RPCs.
6. Outcomes and ROI remain owned by Enterprise/Business analytics RPCs.
7. Network Intelligence consumes the resulting canonical signals and refreshes.

## No second source of truth

- Fleet must not manufacture Enterprise metrics.
- Enterprise must not reconstruct Fleet operational state from UI state.
- Network Intelligence must not persist a parallel copy of Fleet/Enterprise metrics merely for presentation.
- Client IDs select context; server authorization establishes ownership.

## Action boundary

Recommendations may propose actions. The canonical Intelligence Action service owns action-link creation and action lifecycle; domain services remain responsible for the authoritative business/Fleet/Enterprise mutation.

## Event boundary

Successful mutations emit the established workspace update events. Consumers refresh their authoritative reads instead of assuming the event payload is the new source of truth.

## Certification requirement

A future end-to-end test should trace one concrete event from Fleet signal through Enterprise outcome to Network Intelligence refresh and assert identity continuity for business/network/location/campaign where applicable.
