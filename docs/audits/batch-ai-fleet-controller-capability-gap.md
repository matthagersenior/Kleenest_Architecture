# Batch AI — Fleet controller capability gap reconciliation

Date: 2026-08-22

## Result

The dedicated controller-authored Fleet metric-definition/configuration subsystem has not been found in the inspected App/Supabase paths. Treat this as a verified gap candidate, not an assumption.

## App evidence

`fleetEnterpriseBridge.js` exposes Fleet dashboard, service opportunities, access, vehicle/driver/route status, maintenance, alerts, route notifications, partner programs, analytics, benchmarks, ROI, and metric recording. fileciteturn551file0L2-L6

The searched Fleet UI/service paths did not expose a controller workflow for authoring arbitrary Fleet metric definitions, goals, thresholds, or scoring formulas.

## Supabase evidence

Supabase already has related configuration primitives:

- `feature_catalog.configuration` (`jsonb`)
- `progression_challenges.metrics_config` (`jsonb`)
- `progression_games.metrics_config` (`jsonb`)
- configurable `progression_actions`
- `record_progression_metric_event`
- `business_metric_leaderboards`
- `record_enterprise_partner_metric`
- business leaderboard/metric RPCs

But these do not establish a business-scoped Fleet controller metric-definition authority.

## Reconciliation

| Capability | App | Supabase | Status |
|---|---|---|---|
| Fleet dashboard | yes | `fleet_dashboard_summary_v2` | WIRED |
| Fleet access | yes | `has_fleet_access` | WIRED |
| Vehicle/driver/route controls | yes | Fleet RPCs | WIRED |
| Maintenance | yes | `fleet_complete_maintenance` | WIRED |
| Alerts | yes | `fleet_resolve_alert` | WIRED |
| Route notification | bridge exists | `publish_fleet_route_notification` | PARTIAL / consumer audit |
| Partner programs/analytics | bridge exists | partner RPC family | PARTIAL / consumer audit |
| Fleet performance facts | yes | Fleet tables | PRESENT |
| Fleet scorecards/snapshots | yes | Fleet projections | PRESENT |
| Controller-authored metrics | not found | not established | GAP CANDIDATE |
| Controller-authored goals | not found | not established | GAP CANDIDATE |
| Controller thresholds | not found | not established | GAP CANDIDATE |
| Controller scoring formulas | not found | not established | GAP CANDIDATE |
| Controller leaderboard configuration | not found | projection exists | GAP CANDIDATE |

## Important distinction

Existing configuration is not automatically Fleet controller configuration:

```text
feature_catalog.configuration = product capability configuration
progression_* metrics_config = gamification/progression configuration
Fleet controller metric = business-scoped operational measurement configuration
```

Do not collapse these merely because they use JSON/configuration.

## Architecture consequence

Do not create a Fleet-specific metric engine yet. Finish reconciling the existing metric/progression/business capabilities first. If the gap remains, the likely missing layer is a thin business-scoped configuration/adapter over the shared measurement engine:

```text
Fleet operational facts
        ↓
Shared measurement primitives
        ↑
Fleet business configuration adapter
        ↓
Fleet controller views
```

No Production mutation was performed.
