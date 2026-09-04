# Interoperability Gap Queue v2 — 2026-08-28

## P0 — authoritative runtime gates

- [ ] `maps-ingest` v21 completes successfully; record `external_import_jobs.status`, `records_seen`, `records_imported`, `observations_imported`.
- [ ] Billing boot path passes against `user_subscription_summary` / `get_current_user_product_entitlements`.
- [ ] Feature telemetry records authoritative `denied` outcome while retaining original outcome metadata.

## P1 — version-family callers

- [ ] Trace all repository callers of `ingest-map-candidates`, `-v2`, `-v3`.
- [ ] Trace all repository callers of `public-data-ingest` generations.
- [ ] Trace all repository callers of `market-bathroom-ingest` generations.
- [ ] Trace pg_cron and trigger invocations for every family.
- [ ] Compare auth, inputs, outputs, writes, and failure behavior before retirement.

## P1 — notification pipeline

- [ ] Surface authenticated user delivery history through the canonical notification UI where useful.
- [ ] Surface admin aggregate delivery state in the appropriate admin/reporting surface.
- [ ] Keep `enqueue_notification_push_delivery`, `materialize_notification_event`, and `deliver-push-notification` out of consumer capability registries.

## P1 — Fleet metric configuration

- [ ] Verify metric definition/assignment registry against live controller-protected RPCs.
- [ ] Verify manager/controller authorization in the UI action path.
- [ ] Confirm configuration changes produce the expected canonical telemetry/measurement state.

## P2 — backend semantic boundaries

- [ ] Trace `resolve_location_external_identity` callers before changing grants.
- [ ] Confirm `sync_business_service_entitlement` callers and authorization.
- [ ] Document `claim_map_discovery_cell` as cache-leasing infrastructure.
- [ ] Document external observation trigger chain as ingestion authority.

## Retirement rule

Do not delete a versioned function solely because another version appears newer. Retirement requires caller absence, equivalent auth, equivalent writes, equivalent schedule/trigger coverage, and successful live replacement verification.
