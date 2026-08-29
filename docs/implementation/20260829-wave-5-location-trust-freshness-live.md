# Wave 5 — Location Trust / Freshness / Reverification

Status: **Live authority deployed and privilege verified**

This wave turns the existing confidence substrate into an explicit trust clock. Freshness is calculated from authoritative verification/evidence timestamps, with bounded staleness states and a reverification deadline.

Implemented live:

- `location_confidence.freshness_score`
- `location_confidence.staleness_status`
- `location_confidence.reverification_due_at`
- `location_confidence.freshness_computed_at`
- `refresh_location_trust_state(uuid)`
- `get_location_trust_state(uuid)`
- `verification_streaks`
- `record_verification_streak(uuid)`
- `select_reverification_targets(integer)`

Security:

- privileged trust functions are executable by `authenticated` only;
- anonymous EXECUTE is revoked;
- streak rows are protected by RLS and visible only to their owner.

The repository already contains the corresponding migration and freshness audit script; this deployment closes the previous gap where the repository contract existed but the live database did not yet expose the new trust projection.

Next: migrate map/search/discovery projections to consume the trust/freshness projection consistently, then complete route + evidence convergence. AI remains outside authoritative mutation paths.
