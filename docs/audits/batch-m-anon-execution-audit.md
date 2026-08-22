# Batch M — Anonymous execution audit

Date: 2026-08-22

## Result

Production currently grants `anon` EXECUTE on 53 public functions. This is substantially broader than the initial four-function spot check and is now a first-class security/architecture audit item.

## Classification

### Likely intentional public/read capabilities

- `get_amenities_catalog`
- `get_public_restroom_intelligence`
- `home_active_contests`
- `home_active_events`
- `map_location_category`
- `map_network_nearby_v1`
- `nearby_locations`
- `nearby_locations_enriched`
- `nearby_restrooms`
- `search_locations`
- `search_public_data_catalog`
- `kleenest_location_confidence`

These still require output-surface/RLS review because SECURITY DEFINER functions can bypass ordinary table RLS.

### Authenticated/self-authorizing functions incorrectly or unnecessarily exposed to anon

High-priority candidates include:

- `award_business_progression_perk`
- `complete_intelligence_action`
- `create_intelligence_action_link`
- `create_offline_pack`
- `execute_intelligence_action`
- `get_business_product_access`
- `get_current_user_product_entitlements`
- `has_fleet_access`
- `prepare_route_discovery`
- `populate_route_discovery_cache`
- `record_favorite_route_event`
- `record_location_observation`
- `record_location_route_event`
- `refresh_location_feature_summary`
- `submit_location_verification`
- `sync_business_service_entitlement`

Some reject null `auth.uid()` themselves, but leaving them executable by `anon` creates an unnecessarily broad callable surface and makes the security contract dependent on function bodies.

### Security-definer / worker-sensitive candidates requiring immediate review

- `enable_enterprise_fleet_service(p_user_id)` — SECURITY DEFINER and accepts an arbitrary user ID; no visible authorization check in the body.
- `sync_business_service_entitlement(p_business_id)` — SECURITY DEFINER and callable by anon; selects a business member and mutates account entitlements.
- `merge_external_location_metadata(...)` — SECURITY DEFINER and callable by anon; mutates canonical location metadata.
- `publish_intelligence_location_event(...)` — SECURITY DEFINER and callable by anon; creates notification events and recipient deliveries.
- `publish_fleet_route_notification(...)` — SECURITY DEFINER and callable by anon, although it performs route authorization internally.
- `queue_notification_delivery(...)` and `queue_push_deliveries_for_notification(...)` — SECURITY DEFINER delivery infrastructure callable by anon; these should normally be worker/internal contracts.
- `materialize_notification_event(...)` — SECURITY DEFINER and callable by anon; internal materialization should not depend on public execution.
- `resolve_nearby_notification_recipients(...)` — SECURITY DEFINER and callable by anon; exposes recipient resolution that should be deliberately classified.
- `prepare_universal_location_discovery(...)` — SECURITY DEFINER and callable by anon, accepts an explicit `p_user_id`; reconcile with caller identity semantics.
- `claim_map_discovery_cell(...)` — SECURITY DEFINER and callable by anon; appears to be a cache lease primitive and likely belongs to worker/internal infrastructure.

### Data mutation callable by anon

Particular attention is required for:

- `submit_feedback`
- `submit_location_verification`
- `record_location_observation`
- `record_location_route_event`
- `record_favorite_route_event`
- `create_offline_pack`
- `publish_location_notification`
- `create_intelligence_action_link`

These may be intentional public user capabilities, but the desired contract should be `authenticated` unless a documented anonymous use case exists.

## Critical finding

The existence of `anon` EXECUTE does not itself prove exploitability. Many functions perform their own `auth.uid()` checks and some are deliberately public discovery/read helpers. However, privilege exposure is part of the Architecture contract and should not be left implicit.

## GitHub parity clue

The repository contains migration intent around public execution privilege hardening, including `harden_public_execution_privileges` and `revoke_public_worker_execute`. Production must therefore be compared against the repository's intended privilege state before any new migration is authored.

## Recommended fix sequence

1. Keep public read/discovery functions explicitly classified.
2. Revoke anon EXECUTE from worker/internal mutation primitives first.
3. Revoke anon EXECUTE from authenticated-only mutations with no legitimate anonymous path.
4. Preserve public user-facing functions only where an explicit product requirement exists.
5. Prefer wrapper RPCs with explicit caller authorization over exposing low-level worker functions.
6. Re-run the inventory after each security migration.

**No production privileges were changed in this audit.**
