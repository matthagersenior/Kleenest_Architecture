# Maps ingestion deployment/provenance reconciliation — 2026-08-28

## Finding

Production scheduler provenance is now explicit:

- `pg_cron` job `kleenest-maps-st-louis` runs every 6 hours at minute 17 and invokes `/functions/v1/maps-ingest`.
- `pg_cron` job `kleenest-maps-kansas-city` runs every 6 hours at minute 47 and invokes `/functions/v1/maps-ingest`.
- Production also contains `ingest-map-candidates-v3` (version 5), but it is not the scheduled job target.
- Production `maps-ingest` was version 23 and had no corresponding source path in the repository tree, creating deployment provenance drift.

## Reconciliation

The repository now contains the scheduled entrypoint at:

`supabase/functions/maps-ingest/index.ts`

The existing `ingest-map-candidates-v3` is explicitly classified as:

`interactive-discovery-only`

and no longer owns canonical persistence. Canonical scheduled persistence is owned by `maps-ingest`.

A shared contract now defines the scheduled result invariant:

> `ok: true` requires completed job accounting, successful canonical persistence, and zero structured errors.

An empty provider result is represented as `acquisition_status: "empty"` and is only successful when the persistence stage completes successfully as a no-op.

## Reliability controls

- bounded upstream acquisition with endpoint failover and retryable status handling;
- explicit all-provider failure detection;
- partial acquisition is a structured failure rather than a false success;
- canonical RPC failures propagate into failed job accounting;
- stale `running` `maps_ingest` jobs older than 30 minutes are reconciled to `failed`;
- every scheduled run records job version and contract metadata;
- regression tests cover persistence failure, empty acquisition, and upstream failure.

## Production verification performed

Production inspection confirmed:

- project: `ssgesjzdvdsqacdtasje` (`Kleenest Production`);
- active scheduled function: `maps-ingest`;
- production `maps-ingest` version before reconciliation: 23;
- production `ingest-map-candidates-v3` version: 5;
- scheduled cron targets: `maps-ingest` for St. Louis and Kansas City.

## Remaining deployment proof

The repository-side provenance gap is closed. The next proof step is to deploy the repository `maps-ingest` implementation, compare the active production function version/hash, invoke both scheduled markets through the production contract, and verify the resulting `external_import_jobs` rows plus canonical `locations`/map RPC output.
