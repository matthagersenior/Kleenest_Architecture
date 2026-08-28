# Kleenest — 2026-08-28 Large Slice: RPC / Edge Function / Runtime Reconciliation

## Authority
- Repository: `matthagersenior/Kleenest_Architecture`
- Branch: `main`
- Production Supabase: `ssgesjzdvdsqacdtasje`

## Slice status
OPEN — active reconciliation gate. Findings are closed only after runtime/backend verification.

## Current verification

### F1 — Account initialization direct-table failures
The billing read-path was rewired to `user_subscription_summary` and `get_current_user_product_entitlements` in commit `2aadace2dca85bdbb3f0fdda4aa6b3573a0f3804`.

Status: CODE FIXED; fresh production boot/log verification remains required.

### F2 — Feature telemetry outcome mismatch
Coverage/access services now normalize `blocked` to the authoritative `denied` outcome while retaining `original_outcome` metadata. Commits: `6041a10bdde31fc893851619a33bd9df5be91d26` and `e154492c8f62b119ab43b0258e6f9c62ac1b8670`.

Status: CODE FIXED; fresh production-path verification remains required.

### F3 — Versioned ingestion families
Production currently has multiple active version families. Current Edge Function inventory confirms:
- `ingest-map-candidates` v24
- `ingest-map-candidates-v2` v3
- `ingest-map-candidates-v3` v5, JWT disabled, current live discovery path
- `maps-ingest` v21 after the scheduler-auth repair
- `public-data-ingest` / v2 / v3 / v4
- `market-bathroom-ingest` / v2 / v3 / v4 / v5

Status: MATRIXED; no retirement until caller/auth/write/schedule equivalence is proven.

### F4 — Scheduled Maps ingestion authentication failure
The original `maps-ingest` v20 required an admin JWT, while the active pg_cron jobs supplied only the publishable key plus `x-kleenest-scheduler: maps-v1`. That was a concrete scheduler/handler contract mismatch.

Action completed:
- Added Vault-backed `kleenest_maps_scheduler` secret.
- Added service-role-only `get_internal_scheduler_secret()`.
- Deployed `maps-ingest` v21 with `verify_jwt=false` and explicit scheduler-secret authentication while preserving authenticated admin/service-role execution.
- Rewired both active pg_cron jobs through `cron.alter_job()` to read the scheduler credential from Vault.
- Submitted a live St. Louis invocation through the same pg_net path; the resulting `external_import_jobs` record is currently running, proving the scheduler authentication path reached the importer.

Status: AUTH CONTRACT REPAIRED; import completion still needs observation after the Overpass work finishes.

### F5 — Push delivery
Production `deliver-push-notification` remains worker-only (`verify_jwt=false`) and uses worker-secret authorization. Delivery state is persisted in `notification_push_deliveries`.

Action completed:
- Added authenticated `my_notification_push_delivery_status()` for user-scoped delivery history.
- Added admin-gated `admin_notification_push_delivery_summary()` for aggregate delivery reporting.
- Added `deliveryStatus()` to the canonical notification inbox service.
- Both new RPCs have anonymous execution revoked; the user read is authenticated-only and the scheduler secret is service-role-only.

Current production delivery table has no rows yet, so the new read path correctly reports an empty state rather than inventing delivery success.

Status: READ/REPORTING CONTRACT ADDED; UI/reporting consumption remains the next notification sub-slice.

### F6 — Fleet access boundary
Production has `fleet_observe_access`; `has_fleet_access` remains a compatibility read alias. Fleet mutations remain manager/controller gated.

Status: RESOLVED; regression watch.

### F7 — Fleet metric configuration
Current Architecture and Production contain controller-protected metric definition/assignment capabilities. The remaining work is registry/documentation reconciliation and controller UI verification, not invention of a new measurement engine.

Status: OPEN.

## Canonical boundaries preserved
- `locations.id` remains the canonical physical-place identity.
- Maps persisted authority remains `locations` + `map_network_nearby_v1`; live ingestion supplements coverage.
- Push delivery remains worker infrastructure and is never a browser capability.
- Fleet observe/operate/configure remain separate.
- No versioned Edge Function was deleted speculatively.
- Notification delivery state is now exposed through an explicit user/admin read boundary instead of direct table access.

## Repository changes
- `supabase/migrations/20260828170000_notification_delivery_observability_and_maps_scheduler_secret.sql`
- `src/domains/notifications/inbox.js`

## Commits
- `773f39e07419ecd0a0b923f9c5e593d0550f94d7` — notification observability + scheduler secret migration
- `953b18061ec426936add2670a4ec9441313c6516` — canonical notification delivery-status service

## Next large slice
1. Observe the repaired `maps-ingest` run to completion and verify imported/updated/observation counts.
2. Trace all versioned ingestion-family callers and scheduled jobs before any retirement.
3. Surface push delivery status in the appropriate notification/admin reporting UI.
4. Verify Fleet metric configuration registry/controller UI against the live RPC contracts.
5. Re-run the two earlier live-fix verification gates (billing boot path and feature telemetry).

## Acceptance
No finding is GREEN merely because code changed. Each must terminate in authoritative production state and be rechecked through the canonical runtime/backend path.
