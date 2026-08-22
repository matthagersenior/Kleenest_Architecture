# Batch Q — Backend dependency trace

Date: 2026-08-22

## Findings

The previously unverified Supabase functions are not all independent client APIs. Production exposes trigger/function relationships that change their classification.

### Notification push is trigger-driven infrastructure

`notifications` has a trigger named `notifications_push_delivery` that invokes `enqueue_notification_push_delivery`. The function is SECURITY DEFINER and reads the internal push-worker configuration before invoking the push-delivery Edge Function. Therefore `enqueue_notification_push_delivery` is a **worker/internal trigger primitive**, not a consumer capability. It should not be exposed as a normal client RPC even though it currently exists in the public function surface.

### External amenity ingestion is trigger-driven

`external_observations` has trigger `trg_external_amenity_observation` invoking `apply_external_amenity_observation`. That trigger function calls `apply_external_amenity_to_location` when an externally sourced observation is inserted. This confirms an ingestion → observation → canonical-location projection path and means external observation writes are an important authority boundary.

### `claim_map_discovery_cell` is cache-leasing infrastructure

The function only reads/updates `map_discovery_cache` and returns a refresh lease. Its shape and behavior identify it as a concurrency/cache primitive rather than a product command. It should be classified `worker_internal` unless a documented public map-refresh use case is discovered.

### `materialize_notification_event` is an internal projection

The function reads a notification event and materializes in-app notification rows from delivery records. It is a projection/materialization step, not a user-facing notification command. Architecture should model it beneath the notification event pipeline.

### `merge_external_location_metadata` is an ingestion writer

The function directly updates canonical `locations` using external source metadata. It is therefore a privileged ingestion command and must not be treated as a public location-edit capability.

### `resolve_location_external_identity` is an ingestion/read helper

The function resolves an external dataset/external ID or nearby matching canonical location. It does not mutate state. Its likely classification is `worker_internal` or `public_read` depending on actual callers; GitHub caller tracing is still required before changing its grant.

### `sync_business_service_entitlement` is a privileged entitlement projection

The function derives an entitlement from a business tier and writes `account_service_entitlements`. It is not a generic client command. It should be invoked by an authorized business/admin flow or worker triggered by tier changes.

## Architecture implications

The Supabase graph is increasingly clear:

`external_observations → trigger → canonical location amenities`

`notification event → delivery/materialization → notifications → push trigger → Edge Function`

`business tier → entitlement synchronization → account service entitlement`

`map discovery → cache lease → refresh worker`

These are backend pipelines, not UI services.

## Required next work

1. Trace the callers of the entitlement and external-identity functions in all GitHub repository generations.
2. Identify whether map cache leasing has an Edge/worker caller.
3. Identify whether notification materialization is called by a worker, trigger, or application RPC.
4. Map every trigger-owned function into the Architecture dependency graph.
5. Remove low-level worker primitives from the consumer-facing capability registry after the intended replacement/wrapper is documented.

## Gate

No production mutation was performed. This batch is classification and dependency discovery only.
