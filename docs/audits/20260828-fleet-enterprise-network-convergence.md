# Fleet → Enterprise → Network Intelligence Convergence — 2026-08-28

## Completed slice

The existing domain contracts have been reconciled into one interoperability boundary:

`Fleet operational signal → Fleet opportunity → shared intelligence convergence → Enterprise network/campaign context → network outcome/ROI → Network Intelligence refresh`

## Fleet authority

Fleet intelligence reads the canonical Fleet dashboard, service opportunities, business-scoped intelligence, driver leaderboard, and cross-business Fleet network leaderboard. The Fleet UI refreshes from the established live activity events rather than maintaining a second operational dataset.

## Enterprise authority

Enterprise intelligence owns network performance, benchmark, campaign ROI, allocation ROI, network metrics, campaign outcomes, and campaign lifecycle mutations. Enterprise lifecycle resolves partner/program/agreement context from authenticated membership instead of asking operators to manually copy identifiers between screens.

## Shared intelligence boundary

The shared convergence service can produce a Fleet operational snapshot or Business operational snapshot, surface opportunities, subscribe to canonical live event types, and process notification/action jobs. Intelligence actions remain server-authoritative through the canonical action RPCs.

## Important security boundary

Cross-business and cross-network relationships must remain server-authorized. Client-derived business/network IDs are context selectors, not authority. Recommendations are advisory and cannot bypass Fleet, Enterprise, Business, or capability authorization.

## Regression gate

`scripts/fleet-enterprise-network-audit.mjs` statically verifies the required Fleet, Enterprise, lifecycle, shared-convergence, and runtime contracts. This complements the existing intelligence-loop and business-growth-loop audits.

## Remaining certification

The final hardening pass must perform a real authenticated journey across the shared boundary and verify that a Fleet/Enterprise outcome is visible to Network Intelligence after refresh, without a duplicated metric or client-owned source of truth.
