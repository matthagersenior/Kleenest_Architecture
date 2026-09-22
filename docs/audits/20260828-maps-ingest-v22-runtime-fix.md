# Maps Ingest v22 Runtime Fix — 2026-08-28

## Root cause
`maps-ingest` v21 created an `external_import_jobs` row with `status=running` before performing a large synchronous Overpass query. The production invocation ran for 150.756 seconds and returned HTTP 504. Because the request timed out before the function reached its completion/failure update, the job remained apparently running with `started_at=NULL`.

## Fix deployed
`maps-ingest` v22 is active in production.

Changes:
- records `started_at` when the job is created;
- splits each market into four bounded tiles;
- fetches the four tiles concurrently;
- uses a 20-second Overpass query timeout and 22-second client abort;
- retains three endpoint fallbacks per tile;
- deduplicates OSM elements before ingestion;
- permits partial tile success while marking an all-tile failure as failed;
- writes terminal status/counters before returning.

## Existing stale job
Job `4a1dd8fe-81ba-48e0-a099-07b7415c9669` was terminalized as failed with an explicit superseded-by-v22 reason. It imported zero records and is not evidence of successful ingestion.

## Schedule
Existing production cron jobs remain active:
- St. Louis: every six hours at minute 17
- Kansas City: every six hours at minute 47

The v22 deployment will be exercised by those existing schedules; no destructive schedule change was made.

## Verification gate
A v22 invocation is considered successful only if:
1. `started_at` is populated;
2. the job reaches `completed` (or `failed` with actionable error details);
3. `records_seen` is non-zero for a successful market query;
4. imported/updated/observation counters reconcile with downstream canonical records;
5. downstream `external_observations` triggers/projections execute normally.

## Status
DEPLOYED — awaiting the next scheduled/authorized invocation for live completion verification.
