# Business, Fleet, and Enterprise Convergence Design

## Purpose
Unify Kleenest Business, Fleet, Enterprise, and Consumer Explore around one canonical location, entitlement, routing, geofence, notification, and progression backbone.

## Current failures
- Business workspaces resolve through `business_members`, while `get_business_product_access` checks `app_business_memberships`; the latter is empty and causes tier/capability drift.
- Canonical `locations` contains tens of thousands of records, but no current Business workspace has locations attached by `business_id` or `claimed_business_id`, so Business CRUD has no managed location set.
- Fleet already has route/stop/dispatch/geofence/exception backend primitives but its dispatch UI has no map and does not expose stop selection from the canonical location network.
- Enterprise is mostly partner-network/campaign CRUD instead of an operational portfolio over businesses, locations, fleets, routes, and outcomes.

## Canonical architecture
1. `business_members` is the authoritative workspace-membership source. Product access and service entitlements must derive from the selected Business workspace plus owner/admin override, not from `app_business_memberships`.
2. `locations` remains the canonical physical-place table. A Business manages locations attached by `business_id`; `claimed_business_id` is accepted as a migration/claim compatibility path and converges to `business_id` when a claim is approved.
3. Business location UX supports discovery/claiming of existing canonical places as well as creating new locations. All CRUD, media, amenities, QR, reviews, analytics, and Fleet routing use the same canonical location IDs.
4. Fleet gains a reusable native map/planner inspired by Consumer Explore. Fleet planners can search/inspect canonical locations, select ordered route stops, assign driver/vehicle, save, dispatch, and monitor.
5. Fleet route-stop lifecycle produces operational events: planned, dispatched, geofence-arrived, work-started, completed, departed, exception. Existing notification and metric primitives consume those events.
6. Gamification/progression becomes an operational mission layer. Route completion, verified work, on-time stops, preventive work, exception recovery, and streaks award progression through the existing event/progression backbone rather than a disconnected Fleet-only score system.
7. Enterprise becomes a portfolio control plane: cross-business map, locations, fleets, active routes, alerts, campaigns, outcomes, network membership, permissions, and aggregate KPIs.

## Entitlements
- Standard: one managed location; no Fleet; no Enterprise portfolio.
- Growth: up to five managed locations; no Fleet by default.
- Fleet: Fleet enabled for the selected workspace and its managed/authorized route locations.
- Enterprise: unlimited managed locations, Fleet enabled, enterprise network/portfolio features enabled.
- Platform owner: may inspect/switch among authorized demo/managed workspaces without weakening row-level server guards.

## Data flow
Business workspace selection -> membership authorization -> entitlement resolution -> canonical managed-location set -> Business CRUD and Fleet/Enterprise capability surface.

Fleet planner -> canonical location search -> ordered route stop draft -> `fleet_set_route_stops` -> route dispatch -> geofence/timing events -> notifications/metrics/progression -> Enterprise aggregate views.

## Native/OTA boundary
Business backend and JS UI fixes are OTA-capable when the installed runtime matches. Fleet map requires adding a native map dependency to the Fleet binary once; subsequent map behavior can ship OTA.

## Safety and authorization
All mutation RPCs remain server-authorized. Client-side gates are presentation only. Platform-owner override is explicit and never grants anonymous access. Business managers can mutate only their workspace; Fleet route mutations require Fleet manager access; Enterprise mutations require Enterprise entitlement plus network ownership/admin authority.

## Verification
- Workspace switching changes location count and Fleet/Enterprise capabilities immediately and consistently.
- Existing canonical places can be claimed/attached and then appear in Business locations and CRUD.
- Business-created locations appear in Consumer discovery when active and eligible.
- Fleet planner displays canonical location pins, supports selecting/reordering stops, persists them, dispatches only valid routes, and surfaces active execution state.
- Geofence/timing events feed notifications, metrics, and progression.
- Enterprise displays portfolio-level businesses, locations, fleets/routes, alerts, campaigns, and ROI without raw JSON-only presentation.
