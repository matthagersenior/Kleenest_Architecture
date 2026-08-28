# Operational Capability Catalog Accuracy — 2026-08-28

## Finding
The original `admin_operational_capability_catalog()` is not authoritative enough for an operational control-plane view. It contains manually assigned `wired` / `backend_present_ui_gap` states and only dynamically checks whether the named table exists. A table existing does not prove a capability is wired, authorized, callable, or operational.

The original function is defined in `supabase/migrations/20260824120000_operational_capability_catalog.sql` and returns the manually assigned status alongside live table existence/estimated rows. filecite markers are not embedded in repository artifacts; this note records the source path only.

## Changes made

- `src/runtime/OperationalCapabilityPage.jsx` now consumes the protected backend catalog as its operational source rather than treating the React capability registry as the source of truth.
- The page distinguishes backend catalog records from code-registry expectations.
- Missing backend catalog records are not counted as wired.
- The page no longer labels the code registry itself as authoritative.
- Added migration `supabase/migrations/20260828143000_operational_capability_catalog_live_evidence.sql`.

## New backend semantics

The migration changes the meaning of the catalog:

- `missing_backend` — the declared backend resource does not exist.
- `backend_present_ui_gap` — the resource exists but the capability is explicitly known to have a UI/runtime exposure gap.
- `backend_present_unverified` — the resource exists; the old `wired` flag is deliberately downgraded because resource existence alone is not proof of end-to-end wiring.

This is intentionally conservative. A capability becomes operationally trusted only after its caller, authorization, service/RPC/Edge Function, database effect, and runtime/UI path are verified.

## Deployment state

The production DDL replacement was attempted through the Supabase connector but was blocked by the safety layer. Therefore the new SQL migration is committed to `main` but **has not been claimed as deployed to production**.

Until that migration is applied, the existing production RPC remains the old implementation. The UI change is deliberately defensive and treats legacy `wired` results as unverified where possible.

## Next gate

Do not mark the catalog GREEN until:

1. the new migration is applied to production;
2. the protected owner RPC returns the new summary/status fields;
3. the Admin UI consumes those fields;
4. code-registry entries without backend records are surfaced as discrepancies;
5. representative capabilities are traced end-to-end through authorization and actual runtime calls.
