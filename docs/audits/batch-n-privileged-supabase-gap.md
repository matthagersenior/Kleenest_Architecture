# Batch N — Privileged Supabase gap and migration-state audit

Date: 2026-08-22

## Scope

Compare the live Production privilege state against the current `Kleenest_App` migration intent and determine which backend capabilities are actually represented by the client/runtime surface.

## Confirmed migration parity

The reference repository contains two recent migrations intended to remove public execution from four worker/trigger functions: `ingest_external_locations(text,jsonb)`, `enqueue_notification_push_delivery()`, `process_intelligence_action_jobs(integer)`, and `seed_location_verification_campaign(text,integer)`. The live Production project reports `anon`, `authenticated`, and `public` EXECUTE as false for all four. Therefore those specific hardening migrations appear to have reached Production successfully. This is a verified parity point, not a hypothetical gap.

## Remaining privileged surface

Production still has SECURITY DEFINER functions callable by `anon` that are not covered by those two migrations. Highest-risk examples include:

- `enable_enterprise_fleet_service(p_user_id)` — accepts an arbitrary user UUID and directly writes enterprise/fleet entitlement state without an `auth.uid()` reference in the function body.
- `sync_business_service_entitlement(p_business_id)` — resolves a business owner and writes `account_service_entitlements` without an `auth.uid()` reference in the function body.
- `merge_external_location_metadata(...)` — mutates canonical `locations` metadata and has no caller identity check.
- `queue_notification_delivery(...)` — writes notification delivery rows and has no caller identity check.
- `queue_push_deliveries_for_notification(...)` — creates push delivery rows and has no caller identity check.
- `materialize_notification_event(...)` — materializes in-app notifications from event/delivery rows and has no caller identity check.
- `resolve_location_external_identity(...)` — reads canonical location identity and has no caller identity check; this may be an intentional ingestion helper but should be classified as such.
- `claim_map_discovery_cell(...)` — mutates cache lease state and has no caller identity check; this appears to be infrastructure rather than a client capability.
- `resolve_nearby_notification_recipients(...)` — returns nearby recipient user IDs and has no caller identity check; this is particularly sensitive because it is a recipient-resolution primitive.

`prepare_universal_location_discovery(...)` does reference `auth.uid()` through its default parameter but also accepts an explicit `p_user_id` and inserts a session for that supplied user. It therefore needs a caller-identity contract rather than being classified simply as safe because it mentions `auth.uid()`.

## GitHub ↔ Supabase feature reconciliation

The absence of an exact RPC-name search hit in GitHub is not sufficient to declare a feature missing because the client can call a different wrapper/service or use a view/table abstraction. For example, universal discovery is represented in GitHub by `src/services/universalDiscovery.js`, while Production exposes `prepare_universal_location_discovery`. The correct status is therefore **represented capability / unresolved RPC binding**, not missing feature.

Similarly, GitHub has explicit fleet/intelligence/notification runtime surfaces and documentation, while several Production functions are lower-level implementation primitives. They should be mapped to the runtime layer rather than exposed as direct client APIs.

## Hidden/backend-only candidates

The following Production primitives currently have no exact function-name hit in the reference GitHub search used for this batch:

- `enable_enterprise_fleet_service`
- `sync_business_service_entitlement`
- `merge_external_location_metadata`
- `queue_notification_delivery`
- `queue_push_deliveries_for_notification`
- `materialize_notification_event`
- `resolve_location_external_identity`
- `claim_map_discovery_cell`
- `resolve_nearby_notification_recipients`
- `publish_intelligence_location_event`
- `create_gps_geofence_notification`

These are **not automatically orphaned features**. Several are plausible server-side implementation primitives behind capabilities that GitHub clearly represents. They are nevertheless missing an explicit Architecture binding and therefore remain `UNCLASSIFIED-BACKEND-PRIMITIVE` until mapped.

## Security architecture rule established by this batch

The Architecture contract should distinguish at least four callable classes:

1. `public_read` — intentionally callable by anonymous clients.
2. `authenticated_command` — callable only by an authenticated user and self-authorizing.
3. `privileged_command` — requires business/admin/enterprise authorization.
4. `worker_internal` — callable only by trusted server/worker infrastructure.

A SECURITY DEFINER function should not be considered safe merely because it performs an internal check. Its EXECUTE grants are part of the security boundary and must agree with its declared class.

## No mutation performed

No Production privileges or data were changed. The four worker functions covered by the existing GitHub hardening migrations were verified as already non-executable by `anon`, `authenticated`, and `public`.

## Next gate

Before wiring, classify the remaining SECURITY DEFINER + anon surface, map each to either a public capability or internal primitive, and compare the resulting desired privilege matrix to the current Production grants. Only then prepare a migration for the separate development environment.
