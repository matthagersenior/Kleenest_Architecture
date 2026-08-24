# Capability Caller-Boundary Contract — 2026-08-24

## Purpose

Make caller authority explicit in the canonical capability model. A capability is not complete merely because an RPC exists or is reachable through a generic bridge.

## Caller classes

| caller_class | Meaning | Boundary |
| --- | --- | --- |
| `public` | Anonymous/public read capability | UI/runtime may call only through the approved public domain surface |
| `authenticated` | User-authenticated capability | UI/runtime may call through the canonical domain service after authentication |
| `privileged` | Business/enterprise/admin command | UI/runtime may reach only through an authorized domain command; Supabase body-level authorization remains authoritative |
| `worker` | Internal ingestion, delivery, projection, lease, or background processing | Must not be exposed as a generic client capability unless a verified product contract requires it |

## Required architecture boundary

Preferred:

`UI/runtime → domain service → authorized command → Supabase`

Not preferred:

`UI/runtime → generic capability registry → low-level worker RPC`

## Known live-network classifications

- `publish_fleet_route_notification` → `privileged`
- `publish_intelligence_location_event` → `privileged` / `worker` pending caller trace
- `enable_enterprise_fleet_service` → `privileged`
- `queue_notification_delivery` → `worker`
- `queue_push_deliveries_for_notification` → `worker`
- `materialize_notification_event` → `worker`
- `resolve_nearby_notification_recipients` → `worker` / `privileged` pending verified product caller
- `merge_external_location_metadata` → `worker`
- `resolve_location_external_identity` → `worker`
- `claim_map_discovery_cell` → `worker`
- `sync_business_service_entitlement` → `worker` / `privileged` pending migration and caller trace

## Enforcement rule

Do not remove or revoke an existing RPC solely because code search does not find a caller. First trace higher-level services and Supabase migration history. Unverified capabilities remain explicitly marked `unverified` until their caller class is proven.

## Completion criterion

The capability catalog, domain service, UI control, authorization contract, state refresh, telemetry, entitlement, and navigation must agree on the same caller class. Backend-only primitives remain classified as UI gaps rather than being counted as complete product capabilities.
