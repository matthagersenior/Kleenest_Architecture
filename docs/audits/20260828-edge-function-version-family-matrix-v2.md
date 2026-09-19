# Edge Function Version-Family Matrix v2 — 2026-08-28

## Authority
- Repository: `matthagersenior/Kleenest_Architecture`
- Runtime branch: `main`
- Production Supabase: `ssgesjzdvdsqacdtasje`

## Purpose
This matrix separates product-facing APIs from worker/trigger infrastructure and prevents retirement of a version until caller, authentication, write target, schedule/trigger, and replacement equivalence are demonstrated.

## Current family classification

| Family | Current production generations | Canonical role | Auth boundary | Write/side-effect boundary | Disposition |
|---|---|---|---|---|---|
| `ingest-map-candidates` | base v24; v2 v3; v3 v5 | Live map candidate discovery | Mixed; v3 is JWT-off | Discovery/candidate pipeline | KEEP v3; investigate callers before retirement of base/v2 |
| `maps-ingest` | v21 | Scheduled market ingestion | Scheduler Vault secret OR service-role/admin | `external_import_jobs` + `ingest_external_locations` | KEEP; verify completion before further changes |
| `public-data-ingest` | base v5; v2 v6; v3 v6; v4 v1 | Public/external ingestion family | JWT-enabled family | External observations/location ingestion | MATRIX; caller equivalence required |
| `market-bathroom-ingest` | base v1; v2 v2; v3 v1; v4 v1; v5 v2 | Bathroom/source ingestion | JWT-enabled family | External observation/location ingestion | MATRIX; caller equivalence required |
| `deliver-push-notification` | v1 | Push delivery worker | JWT disabled + worker secret | Push delivery + persisted delivery state | INTERNAL; never consumer-facing |
| Stripe checkout/portal/webhook | active commerce functions | Commerce | Webhook is intentionally JWT-off | Checkout/session/webhook side effects | KEEP; preserve webhook exception |

## Internal trigger/worker primitives

These are not normal UI capabilities:

- `enqueue_notification_push_delivery` — notification trigger primitive.
- `materialize_notification_event` — notification projection/materialization.
- `claim_map_discovery_cell` — cache lease/concurrency primitive.
- `apply_external_amenity_observation` — external observation trigger projection.
- `apply_external_amenity_to_location` — canonical location projection.
- `merge_external_location_metadata` — privileged ingestion writer.
- `resolve_location_external_identity` — ingestion/read helper; caller tracing required before grant changes.
- `sync_business_service_entitlement` — privileged entitlement projection.

## Canonical backend pipelines

```text
External source
  -> external_observations
  -> trigger
  -> canonical locations / amenities

Notification event
  -> delivery/materialization
  -> notifications
  -> push trigger
  -> deliver-push-notification
  -> notification_push_deliveries

Business tier
  -> entitlement synchronization
  -> account_service_entitlements

Map discovery
  -> cache lease
  -> refresh worker
  -> canonical discovery data
```

## Retirement gate

A version is a `RETIRE-CANDIDATE` only when all are proven:

1. No repository caller remains.
2. No Edge Function caller remains.
3. No pg_cron/trigger invocation remains.
4. Authentication is equivalent or intentionally replaced.
5. Authorization semantics are equivalent.
6. Write targets and side effects are equivalent.
7. Replacement has succeeded on the live production path.
8. Failure/rollback behavior is documented.

## Immediate verification queue

1. Observe `maps-ingest` v21 through terminal job state and imported/updated/observation counts.
2. Enumerate repository references for every versioned ingestion family.
3. Enumerate production pg_cron invocations for those families.
4. Compare v3 map discovery request/response contract with base/v2 before any cleanup.
5. Trace `resolve_location_external_identity` callers.
6. Confirm notification materialization callers and keep the primitive out of consumer capability registries.
7. Confirm `sync_business_service_entitlement` is only reachable through authorized business/admin or worker paths.

## Status
OPEN — reconciliation in progress. No destructive retirement is authorized by this document.
