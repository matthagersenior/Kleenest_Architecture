# Business Growth Loop Convergence Audit — 2026-08-28

## Scope

Validate the canonical Business loop after attribution convergence:

`location intelligence → recommendation → authorized action → authoritative business mutation → QR/campaign/promotion attribution → ROI/outcome → refreshed intelligence`

## Verified repository contracts

- `src/domains/business/intelligence.js` exposes the canonical attribution funnel through `get_business_attribution_funnel` and ROI through `business_roi_analytics`.
- Business intelligence actions terminate through authoritative business RPCs rather than client-side state mutation.
- `src/domains/intelligence/actions.js` provides the canonical action-link, execute, and complete lifecycle.
- `src/domains/intelligence/convergence.js` provides the shared create/execute/complete/process-jobs boundary and live refresh propagation.
- `BusinessIntelligencePage` consumes canonical location intelligence and persisted action links and refreshes on intelligence/live events.
- `BusinessIntelligenceActions` performs capability authorization before execution and exposes outcome/reporting navigation after successful actions.

## Security/interoperability rule

Recommendations are advisory. Authorization and authoritative mutation remain server/domain responsibilities. Attribution must remain scoped to the QR/business/location relationship established by the canonical attribution contract; invalid cross-business attribution must not influence business outcomes.

## Acceptance gate

The repository now has an explicit static regression gate for the complete Business growth-loop contract. This gate is intended to catch future refactors that silently remove attribution, ROI, action lifecycle, or refresh/reporting interoperability.

## Remaining runtime proof

Static presence is not production proof. The final certification pass must exercise a real business journey against production-shaped Supabase authority and verify that a resulting attribution/outcome changes the next intelligence read without introducing a second metrics model.
