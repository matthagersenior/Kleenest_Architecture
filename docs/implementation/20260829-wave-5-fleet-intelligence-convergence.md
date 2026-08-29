# Wave 5 — Fleet operational → canonical intelligence convergence

Status: **Implemented and live-verified**

Fleet operational events now converge server-side into `data_feature_events`, the canonical feature/intelligence event graph.

## Contract

`fleet_operational_events → data_feature_events → intelligence/notification/action → outcome`

The trigger is `SECURITY DEFINER`, deduplicates by source event id, and preserves vehicle, driver, route, business, coordinates, unit, and source metadata.

The repository migration and live Supabase migration are now both present, eliminating the previous production/repository migration-history divergence.

## Verification

Live database verification confirms the trigger `fleet_operational_event_intelligence_convergence` exists on `fleet_operational_events` and invokes `converge_fleet_operational_event_to_intelligence()` with `SECURITY DEFINER` execution.

## Next

Continue Fleet notification/action delivery verification and then close the remaining Enterprise operational event consumers without introducing a second event graph.
