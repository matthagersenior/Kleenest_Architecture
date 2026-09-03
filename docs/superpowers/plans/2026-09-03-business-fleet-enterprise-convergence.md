# Business Fleet Enterprise Convergence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Business, Fleet, and Enterprise operate on one canonical location and entitlement graph, with Fleet map-based routing/dispatch and Enterprise portfolio visibility.

**Architecture:** Supabase is the canonical authority for workspace membership, entitlements, managed locations, route stops, geofence/timing events, notifications, metrics, and progression. Business and Fleet remain separate Expo apps, but share IDs and server contracts; Fleet adopts the Consumer map/planning interaction pattern with one required native rebuild for its map dependency.

**Tech Stack:** Supabase PostgreSQL/RPC/RLS, Expo SDK 57, Expo Router, React Native 0.86, MapLibre React Native, GitHub Actions/EAS Updates.

**Spec:** `docs/superpowers/specs/2026-09-03-business-fleet-enterprise-convergence-design.md`

## Global Constraints
- `business_members` is the authoritative membership source.
- `locations` is the canonical physical-place table.
- Server-side authorization remains mandatory for every mutation.
- Fleet map requires one native Fleet APK rebuild; later JS/map behavior may ship OTA.
- Existing Consumer location IDs and existing Fleet route/event tables remain canonical; do not fork them.

---

### Task 1: Canonical workspace entitlements
**Files:** Supabase migration; Business `src/state/businessWorkspace.tsx`; Fleet `src/state/FleetWorkspace.tsx`; service tests/audits.
**Produces:** `get_business_product_access(uuid)` and `has_fleet_access(uuid)` resolve consistently from `business_members` + service entitlement + business tier.
- [ ] Add a failing SQL verification query showing a `business_members` workspace omitted by the old `app_business_memberships` check.
- [ ] Replace product-access membership lookup with `business_members` owner/admin/member authorization while preserving platform-owner override.
- [ ] Verify Standard/Growth/Fleet/Enterprise flags and limits for every workspace.
- [ ] Verify Fleet workspace filtering uses the same entitlement result.
- [ ] Commit migration and client audit updates.

### Task 2: Canonical managed-location set and claim flow
**Files:** Supabase migration; Business `src/services/business.ts`; `app/locations.tsx`; new claim/discovery helpers.
**Produces:** `business_list_locations`, `business_search_claimable_locations`, `business_claim_location` with canonical location IDs.
- [ ] Add failing SQL checks proving existing workspaces return zero while canonical locations exist.
- [ ] Extend managed-location read to include approved claim compatibility and converge approved claims to `business_id`.
- [ ] Add authorized location search by name/address/brand and claim action.
- [ ] Update Business Locations UI with `Add new` and `Claim existing` paths, map coordinates, and usable amenity selection.
- [ ] Verify create/update/activate/media/amenities all operate on claimed or created canonical IDs.

### Task 3: Business workspace capability convergence
**Files:** Business dashboard/index, workspace provider, Enterprise gate, Fleet handoff UI, CRUD screens.
**Produces:** selected workspace drives location count, limits, Fleet enabled, Enterprise enabled, and all CRUD page context.
- [ ] Add an audit fixture covering four tiers and workspace switching.
- [ ] Remove stale client assumptions derived from zero location counts.
- [ ] Render tier/capability state from one `access` object after every workspace switch/refresh.
- [ ] Add Fleet launch/handoff affordance only for Fleet-enabled workspace and Enterprise entry only for Enterprise-enabled workspace.
- [ ] Verify no screen keeps previous workspace IDs after switching.

### Task 4: Fleet native map foundation
**Files:** Fleet `package.json`, `app.config.ts`, new `src/components/FleetMap.tsx`, native build workflow.
**Produces:** MapLibre map available in Fleet with canonical location markers and driver/vehicle overlays.
- [ ] Add MapLibre dependency compatible with Expo SDK 57 and app config plugin/native requirements.
- [ ] Add a planner map component with OSM style, camera, location marker, location pins, selected-state card, and brand icon fallback.
- [ ] Run typecheck and parity audit.
- [ ] Trigger and verify a new standalone Fleet APK build.

### Task 5: Fleet Explore-style route planner
**Files:** Fleet `app/dispatch.tsx`; `src/services/fleet.ts`; new `src/services/locations.ts`; `FleetMap.tsx`.
**Produces:** search -> select pins/results -> ordered draft stops -> save via `fleet_set_route_stops` -> dispatch.
- [ ] Add failing planner-state tests/audit for add/remove/reorder/deduplicate stops.
- [ ] Query canonical locations with coordinates/search radius and business-managed location emphasis.
- [ ] Integrate map and scrollable results into Dispatch Center.
- [ ] Add selected-location card with full details, add/remove stop, and route-order controls.
- [ ] Persist ordered canonical location IDs with `setRouteStops` and reload them from `fleet_route_stops`.
- [ ] Validate driver + vehicle + >=1 stop before dispatch and surface server errors inline.

### Task 6: Geofence execution, notifications, and progression
**Files:** Supabase migration/functions; Fleet execution/signals services/screens; shared progression/event RPCs where present.
**Produces:** route stop arrival/dwell/departure/completion events feed operational events, notifications, metrics, and progression.
- [ ] Add failing SQL tests for idempotent timing-event transitions.
- [ ] Normalize geofence arrival/departure and manual completion into one route-stop event vocabulary.
- [ ] Publish notification events for dispatch, approaching/arrived, overdue, exception, completed route.
- [ ] Award progression for valid operational achievements using existing progression backbone and idempotency keys.
- [ ] Verify offline replay does not double-award progression or duplicate notifications.

### Task 7: Enterprise portfolio control plane
**Files:** Business `app/enterprise.tsx`, `src/services/enterprise.ts`; Supabase portfolio summary RPCs; optional shared map component.
**Produces:** cross-business portfolio map and operational summaries over businesses, locations, fleets/routes, alerts, campaigns, outcomes, ROI.
- [ ] Add a failing portfolio summary query for an Enterprise workspace.
- [ ] Create authorized Enterprise portfolio summary/location/active-route RPCs.
- [ ] Replace raw summary-heavy UI with cards/tables/map-ready data: businesses, locations, active routes, alerts, campaign outcomes, ROI.
- [ ] Preserve partner network/campaign CRUD beneath the new operational overview.
- [ ] Verify non-Enterprise workspaces cannot read portfolio data.

### Task 8: OTA/build delivery and end-to-end verification
**Files:** Business/Fleet GitHub workflows, OTA triggers, parity audits/docs.
**Produces:** Business OTA published; Fleet native APK produced then Fleet OTA published; all cross-app flows verified.
- [ ] Run Business typecheck/audit and publish OTA.
- [ ] Run Fleet typecheck/audit, standalone APK workflow, then OTA channel publish against the new runtime.
- [ ] Verify Business workspace switching, location claims/CRUD, Fleet map route creation, dispatch, geofence/timing, notifications/progression, and Enterprise portfolio.
- [ ] Record final commit SHAs, workflow run IDs, and usable artifact links.
