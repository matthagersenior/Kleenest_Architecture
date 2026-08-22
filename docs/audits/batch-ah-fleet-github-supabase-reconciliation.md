# Batch AH — Fleet GitHub ↔ Supabase capability reconciliation

Date: 2026-08-22

## Confirmed app-to-Supabase wiring

`FleetOperationsPage.jsx` exposes business selection, Fleet access, dashboard retrieval, service opportunities, vehicle/driver/route controls, maintenance completion, and alert resolution. `fleetEnterpriseBridge.js` maps those surfaces to `fleet_dashboard_summary_v2`, `fleet_service_opportunities_for_business`, `has_fleet_access`, `fleet_set_vehicle_status`, `fleet_set_driver_status`, `fleet_set_route_status`, `fleet_complete_maintenance`, and `fleet_resolve_alert`. The bridge also exposes `enable_enterprise_fleet_service` and `publish_fleet_route_notification`. fileciteturn542file0L2-L6 fileciteturn539file0L2-L6

## Fleet network intelligence

`FleetReviewPage.jsx` adds Fleet/admin capability gating, restroom/location discovery, location intelligence signals, Fleet recommendations, live Fleet/location events, service-health/conflict/stale-signal views, route opening, and demand/activity/quality/network-confidence metrics. This is a distinct Fleet intelligence capability from the operational control surface. fileciteturn545file0L2-L7

## Capability Center finding

`CapabilityCenterPage.jsx` uses `feature_catalog` and `user_feature_entitlements` as a live capability/access layer and maps product categories to UI destinations. However, Fleet and several other categories currently have null read tests, so the Capability Center can report catalog/contract mapping without executing a domain-specific live read for those categories. This is an app verification gap, not evidence that the Supabase capability is absent. fileciteturn540file0L2-L7

## Controller customization finding

The Fleet pages/services reviewed expose operational controls and network intelligence, but no dedicated controller UI for creating/editing arbitrary Fleet metric definitions, goals, thresholds, or scoring formulas was found. The Supabase audit also has not established a dedicated metric-definition/configuration table or RPC.

Therefore customizable controller metrics remain **unconfirmed**, not a capability we should invent yet.

## Reconciliation matrix

| App capability | Supabase status | Result |
|---|---|---|
| Fleet access gating | wired | confirmed |
| Fleet dashboard | wired | confirmed |
| service opportunities | wired | confirmed |
| vehicle controls | wired | confirmed |
| driver controls | wired | confirmed |
| route controls | wired | confirmed |
| maintenance completion | wired | confirmed |
| alert resolution | wired | confirmed |
| Fleet route notifications | bridge capability exists | audit call sites next |
| enterprise partner network | bridge capability exists | separate Enterprise domain |
| network intelligence | app capability | cross-service/RPC trace still needed |
| configurable Fleet metrics | not confirmed | gap/unknown |
| configurable goals/thresholds | not confirmed | gap/unknown |
| controller-configured scoring | not confirmed | gap/unknown |
| controller leaderboard configuration | not confirmed | gap/unknown |

## Architecture reconciliation

```text
Fleet Operations
  ├── operational controls → existing Fleet RPCs
  ├── network intelligence → location/intelligence contracts
  └── performance configuration → shared measurement framework
                                 (not yet confirmed wired)
```

The architecture must preserve existing Fleet operational authorities while continuing to reconcile the configurable measurement layer against actual Supabase capabilities.

## Next verification batch

1. Trace every `fleetEnterpriseBridge.js` export that is not surfaced by `FleetOperationsPage`.
2. Trace `FleetReviewPage` intelligence calls to their Supabase contracts.
3. Find every call site of `publishFleetRouteNotification`.
4. Inspect Fleet entries in `feature_catalog` and their `configuration` JSON.
5. Search Supabase for generic configuration/settings structures that could already represent controller metric definitions.
6. Trace Fleet scorecard/leaderboard RPCs to their app consumers.

No Production mutation was performed.
