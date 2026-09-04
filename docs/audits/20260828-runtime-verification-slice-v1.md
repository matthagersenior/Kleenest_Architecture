# Runtime Verification Slice v1 — 2026-08-28

## Scope
Production Supabase runtime verification after Edge Function version-family reconciliation.

## Maps ingestion result
The latest `maps_ingest` job was created at `2026-08-28 17:04:33 UTC` and is currently `running` with zero records observed/imported so far. There are also 9 historical failed `maps_ingest` jobs and 2 completed jobs. This is not sufficient evidence to declare v21 healthy.

### Decision
**OPEN / NOT VERIFIED.** Do not retire older Maps ingestion paths or merge scheduled ingestion with candidate discovery until the live job reaches a terminal state with meaningful counters.

## Discovered schema correction
`external_import_jobs` uses:
- `error_detail` (jsonb), not `error_message`
- `finished_at`, not `completed_at`
- `records_seen`
- `records_imported`
- `observations_imported`
- `errors`

Future verification queries must use the live schema above.

## Scheduled execution model
The repository audit identifies two active Maps schedules:
- St. Louis → `maps-ingest`
- Kansas City → `maps-ingest`

It also identifies Intelligence notification and action workers as active scheduled capabilities. These are asynchronous infrastructure and must remain separate from consumer-facing RPC capability lists.

## Next verification gates
1. Poll latest `maps_ingest` job until `completed` or `failed`.
2. If failed, capture `error_detail` and inspect v21 request/auth/write path before any cleanup.
3. If completed with zero imports, treat as a data-source/query failure rather than a success.
4. If completed with imports, verify resulting canonical locations/observations and downstream triggers.
5. Only after successful replacement verification, begin caller-level retirement analysis for older ingestion generations.

## Safety
No production DDL or destructive function retirement performed in this slice.
