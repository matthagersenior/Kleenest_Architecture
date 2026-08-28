# Kleenest — 2026-08-28 Large Slice: RPC / Edge Function / Runtime Reconciliation

## Authority
- Repository: `matthagersenior/Kleenest_Architecture`
- Branch: `main`
- Production Supabase: `ssgesjzdvdsqacdtasje`

## Slice status
OPEN. This slice is the active reconciliation gate. Findings are fixed only after runtime/backend verification.

## Confirmed findings

### F1 — Account initialization direct-table failures
Production API logs show authenticated `subscriptions` requests returning 403 and `account_service_entitlements` requests returning 400 while `get_current_user_product_entitlements` succeeds. `AppContext` loads subscription and service entitlements through `billing/catalog.js`, which currently reads those tables directly.

Action taken: `billing/catalog.js` was rewired to use `user_subscription_summary` and `get_current_user_product_entitlements` for the current-user reads. Commit: `2aadace2dca85bdbb3f0fdda4aa6b3573a0f3804`.

Verification still required: live API logs must show the boot path no longer calling the failing direct-table reads.

### F2 — Feature telemetry outcome mismatch
Production `record_feature_access` accepts `allowed`, `locked`, `denied`. Runtime coverage services were able to send `blocked`, producing observed HTTP 400s. The mismatch was confirmed in both the production function contract and API logs.

Action taken: `src/domains/entitlements/coverage.js` and `src/domains/entitlements/access.js` now normalize `blocked` to authoritative `denied` while preserving `original_outcome` in metadata. Commits: `6041a10bdde31fc893851619a33bd9df5be91d26` and `e154492c8f62b119ab43b0258e6f9c62ac1b8670`.

Verification still required: run the affected gate paths and confirm `record_feature_access` no longer produces 400s.

### F3 — Versioned ingestion families
Production has active version families for `public-data-ingest`, `market-bathroom-ingest`, and `ingest-map-candidates`. Inspected versions are behaviorally different; for example `public-data-ingest-v2` contains queue functionality not present in the older base function. `ingest-map-candidates-v3` is returning successful production requests.

Action: no destructive cleanup. Caller/auth/write/schedule matrix required before retirement.
Status: MATRIX REQUIRED.

### F4 — Scheduled Maps ingestion failure
Production Edge Function logs show repeated HTTP 500s from `maps-ingest` v20 while `ingest-map-candidates-v3` v5 is returning HTTP 200. The runtime discovery path already calls v3, but scheduled Maps ingestion still targets `maps-ingest`.

Action: inspect `maps-ingest` v20 and its scheduled caller before changing cron or deploying a replacement.
Status: OPEN — high priority.

### F5 — Push delivery
`deliver-push-notification` is correctly worker-only (`verify_jwt=false`) and validates a worker secret. It writes delivery state to `notification_push_deliveries`. Client registration uses authenticated RPCs. Do not expose the worker endpoint to the browser.

Status: NEXT SLICE — delivery state still needs a safe product/reporting read path.

### F6 — Fleet access boundary
Production now has `fleet_observe_access`; `has_fleet_access` is a compatibility read alias and Fleet mutations remain manager/controller gated. Current Architecture preserves observe vs operate/configure separation.

Status: RESOLVED; regression watch.

### F7 — Fleet metric configuration
Current Architecture contains controller-protected metric definition/assignment services and corresponding production migrations. Earlier audit text calling this unconfirmed is stale.

Status: OPEN — reconcile registry/documentation and verify controller UI before GREEN.

## Production evidence
- Production project is ACTIVE_HEALTHY.
- Realtime connections are succeeding.
- `get_current_user_product_entitlements` is succeeding.
- `admin_operational_capability_catalog` is succeeding.
- `record_feature_access` had 400s before the telemetry normalization commits.
- `subscriptions` had 403s and `account_service_entitlements` had 400s before the billing read-path commit.
- `maps-ingest` has repeated 500s; `ingest-map-candidates-v3` has successful 200s.

## Canonical boundaries preserved
- Location identity remains `locations.id`.
- Maps persisted authority remains `locations` + `map_network_nearby_v1`; live ingestion supplements coverage.
- Push delivery remains worker infrastructure.
- Fleet observe/operate/configure remain separate.
- No RPC overload or Edge Function generation was deleted speculatively.

## Next large slice
1. Verify the two live fixes against fresh production logs.
2. Inspect and reconcile `maps-ingest` v20 against `ingest-map-candidates-v3` and scheduled execution.
3. Build the version-family caller/auth/write/schedule matrix.
4. Close push delivery observability.
5. Reconcile Fleet metric configuration documentation and UI.

## Acceptance
No finding is closed merely because code changed. Each must be retested through the canonical runtime and production backend path.
