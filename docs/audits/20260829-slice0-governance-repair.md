# Slice 0 — Governance / authority repair — 2026-08-29

## Scope

Reconciled live Supabase authority against the canonical `main` implementation and the next-cluster plan. This slice specifically addressed the remaining anonymous `SECURITY DEFINER` execution surface and a live canonical maps-ingestion persistence failure.

## Live findings

- Supabase project `ssgesjzdvdsqacdtasje` is healthy and reachable.
- `public.capability_function_classifications` contains 442 classified function signatures with 0 unclassified rows; 17 are explicitly classified as privileged/internal/legacy.
- Before this slice, 5 public `SECURITY DEFINER` functions were executable by `anon` without a capability classification.
- Three of those were not client-facing and were closed: `admin_backend_resource_catalog()`, `converge_fleet_operational_event_to_intelligence()`, and `sync_external_location_address()`.
- Two are intentionally public read/landing contracts and remain anonymous: `get_public_qr_landing(text)` and `map_network_nearby_v1(...)`.
- After the repair there are 4 anonymous `SECURITY DEFINER` functions and 0 unexplained anonymous `SECURITY DEFINER` functions.

## Maps ingestion repair

The live `maps-ingest` scheduler was reaching canonical persistence but repeatedly failed with `Authentication required for ingestion`. The root cause was the authorization guard inside the `SECURITY DEFINER` ingestion function: the function executes as its `postgres` owner, while the guard only allowed `service_role` when `auth.uid()` was null.

The canonical guard now permits `service_role` or the trusted `postgres` `SECURITY DEFINER` execution context, while still rejecting unauthenticated browser execution. A direct database authority test now succeeds with an empty OSM batch.

The next scheduled `maps-ingest` run should be used as the end-to-end acquisition/persistence verification. The prior long-running job is stale and will be recovered by the function's existing stale-job recovery logic on the next invocation.

## Repository / production synchronization

Two migrations were applied to Production and committed to `main`:

- `20260829171446_fix_internal_ingestion_security_definer_authorization.sql`
- `20260829171500_classify_and_close_remaining_public_security_definer_surface.sql`

The second commit also records the capability classifications for the five previously unexplained anonymous `SECURITY DEFINER` functions.

## Acceptance gate status

- Canonical authority: PASS
- Function classification: PASS (0 unclassified)
- Anonymous privileged boundary: PASS (0 unexplained anonymous SECURITY DEFINER functions)
- Production migration applied: PASS
- Repository migration recorded: PASS
- Direct ingestion authorization test: PASS
- Scheduled external acquisition/persistence: PENDING next scheduled run
- Remaining security-advisor findings: existing broader backlog; not silently treated as slice-complete

## Next cluster

Continue Slice 0 only until the scheduled maps ingestion run is verified, then advance into Slice 1 (consumer evidence loop) as a complete front-to-back slice rather than isolated UI patches.
