# Batch O — RLS / SECURITY DEFINER boundary audit

Date: 2026-08-22

## Findings

### RLS coverage

The live public relational tables surveyed are consistently configured with RLS enabled. This is a strong baseline, but it does not make SECURITY DEFINER RPCs safe automatically: a SECURITY DEFINER function can operate with owner privileges and therefore must be reviewed as an explicit API boundary.

### Current privileged public surface

The live database still has 20+ SECURITY DEFINER functions with `anon` EXECUTE. Several are clearly public reads, but a subset are mutation/infrastructure functions. The highest-risk categories are entitlement mutation, canonical location mutation, notification delivery/materialization, external identity resolution, discovery-cache leasing, and recipient resolution.

### Critical mismatch discovered

The GitHub migration `20260821230000_wire_server_authoritative_checkin_and_observation_events.sql` defines `create_check_in` and `submit_restroom_observation` as SECURITY DEFINER functions and explicitly checks `auth.uid()` before proceeding. The same migration updates canonical state and emits server-authoritative feature events. This is the intended command pattern: authenticated caller → server-authoritative RPC → canonical mutation → event.

This gives Architecture a concrete contract to preserve: do not move these mutations into client-side table writes merely because RLS exists.

### Observation aggregate nuance

`submit_restroom_observation` directly updates bathroom aggregates on `locations`. Earlier audit work identified `record_location_verification` plus `process_bathroom_verification` as a possible double-write path. These are distinct observation systems and must not be conflated. Before fixing anything, Architecture must map which observation RPC/table/trigger is active for each product surface.

### Identity rule

A function that accepts `p_user_id` or `p_business_id` is not necessarily unsafe; the determining questions are whether it is public, whether the caller is authenticated, whether the function binds the target to `auth.uid()`, and whether it is intentionally a worker/admin primitive. Parameter shape alone is insufficient evidence.

## Required classification

Every SECURITY DEFINER function should receive one of:

- `public_read`
- `authenticated_command`
- `privileged_command`
- `worker_internal`
- `legacy_unclassified`

And the database grant should match that classification.

## Immediate review queue

1. `enable_enterprise_fleet_service`
2. `sync_business_service_entitlement`
3. `merge_external_location_metadata`
4. `queue_notification_delivery`
5. `queue_push_deliveries_for_notification`
6. `materialize_notification_event`
7. `resolve_nearby_notification_recipients`
8. `resolve_location_external_identity`
9. `claim_map_discovery_cell`
10. `publish_intelligence_location_event`
11. `publish_fleet_route_notification`

## Gate

No production mutation was performed. The next security fix should be authored only after each candidate is mapped to its GitHub caller(s), worker/admin ownership, and intended anonymous behavior. Public privileges should then be changed in a single reviewed migration batch, preferably in the future isolated development project/branch rather than directly in Production.
