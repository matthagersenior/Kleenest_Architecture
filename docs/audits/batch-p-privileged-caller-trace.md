# Batch P — Privileged caller trace

Date: 2026-08-22

## Scope

Trace the high-priority SECURITY DEFINER functions from Batch O into the current GitHub runtime and capability contract.

## Confirmed caller contract

`src/services/platformCapabilities.js` is a significant canonical bridge. Its shared `call()` helper first calls `supabase.auth.getUser()` and refuses to continue without an authenticated user, then invokes the named Supabase RPC. The file groups calls into consumer, evidence, routing, liveNetwork, enterprise, fleet, business, admin, and QR capabilities. The same file also exposes a `capabilityContracts` registry mapping product capability groups to RPC names. This means GitHub already has an explicit client-side capability-to-RPC map.

## High-priority function mapping

### `enable_enterprise_fleet_service`

GitHub: `platformCapabilities.enterprise.enableFleetService(userId)` exists. The call path is authenticated through the shared `call()` helper, but the helper permits an explicit target user ID to be passed to the RPC. Supabase function-body authorization remains the authoritative security question. Architecture classification: `privileged_command` candidate; requires business/enterprise authorization, not merely generic authentication.

### `publish_fleet_route_notification`

GitHub: `platformCapabilities.liveNetwork.publishFleetRoute` exists, and the function is also referenced by the Fleet Enterprise Intelligence and notifications services. It is therefore not an orphan. Architecture classification: `privileged_command` / fleet-enterprise action. Supabase body-level authorization must remain authoritative.

### `queue_notification_delivery`

GitHub: `platformCapabilities.liveNetwork.queueDelivery` exposes it through the generic authenticated capability bridge. This is an important architectural smell: a worker-looking delivery primitive is currently represented as a client capability. It should be classified explicitly as `worker_internal` unless there is a verified product flow that legitimately requires the client to enqueue delivery directly.

### `queue_push_deliveries_for_notification`

GitHub: `platformCapabilities.liveNetwork.queuePushDelivery` exposes it from the same client-facing bridge. This similarly looks like delivery infrastructure rather than a consumer/business command. Candidate `worker_internal`; verify callers before privilege changes.

### `resolve_nearby_notification_recipients`

GitHub: `platformCapabilities.liveNetwork.nearbyRecipients` exposes the RPC. This is a sensitive recipient-resolution primitive. It may support the live network feature, but exposing raw recipient resolution to the client should be reconsidered. Candidate `worker_internal` or `privileged_command` depending on verified use.

### `publish_intelligence_location_event`

GitHub: `platformCapabilities.liveNetwork.publishLocation` exposes it. This is not orphaned; it belongs to the live network/intelligence event pipeline. Candidate `privileged_command` or `worker_internal` depending on caller tracing.

### `sync_business_service_entitlement`

No exact GitHub code-search caller was found in the current repository search. Supabase capability exists, but the client capability registry does not expose this exact RPC. Classification: `worker_internal` / `privileged_command` candidate, not a known public client contract. Do not revoke or alter until migration/history and worker callers are traced.

### `merge_external_location_metadata`

No exact GitHub caller found in the current repository search. Classification: likely `worker_internal` ingestion primitive, but not yet proven. Do not expose as a client capability merely because the function exists.

### `materialize_notification_event`

No exact GitHub caller found in the current repository search. Classification: likely `worker_internal` projection/materialization primitive.

### `resolve_location_external_identity`

No exact GitHub caller found in the current repository search. Classification: likely `worker_internal` ingestion/identity-resolution primitive.

### `claim_map_discovery_cell`

No exact GitHub caller found in the current repository search. Classification: likely `worker_internal` cache/lease primitive.

## Important discovery

The client-facing `platformCapabilities.js` registry is broader than a pure UI API: it exposes several low-level infrastructure RPCs under `liveNetwork`. That is a potential architecture cleanup target. The preferred future boundary is:

UI/runtime → domain service → authorized command → Supabase

rather than:

UI/runtime → generic capability registry → low-level worker RPC

## No false orphan classification

Absence of an exact RPC-name search hit is not proof that a capability is unused. Several backend primitives are represented indirectly through higher-level services or the capability registry. These are therefore marked `unverified` rather than deleted/legacy.

## Recommended changes — NOT YET APPLIED

1. Split `platformCapabilities.liveNetwork` into user/business commands versus internal delivery/event primitives.
2. Keep `enable_enterprise_fleet_service` behind explicit enterprise authorization.
3. Move notification queue/materialization/recipient-resolution primitives behind worker or privileged service boundaries unless a verified user-facing requirement exists.
4. Trace Supabase migration history for the unreferenced ingestion/cache/identity functions before changing grants.
5. Add an Architecture capability contract field for `caller_class` (`public`, `authenticated`, `privileged`, `worker`).

**No Production data, function definitions, or privileges were changed in this batch.**
