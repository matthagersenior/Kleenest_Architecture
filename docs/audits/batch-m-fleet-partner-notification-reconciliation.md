# Batch M — Fleet / partner / notification / feature-registry reconciliation

Date: 2026-08-22

## Scope

This pass reconciles the capability clusters called out after the Fleet controller-metric audit against the live Production Supabase schema/function definitions. It is discovery/classification only. No Production mutation was performed.

## Findings

### 1. Enterprise / partner capabilities are substantially wired at the backend boundary

Production contains first-class enterprise partner networks, campaigns, allocations, memberships, outcomes, daily network metrics, invitations, activation/pause, and status management.

The read side is materially richer than simple CRUD:

- `get_enterprise_partner_network` returns network membership and aggregate visits, check-ins, reviews, preferred uses, access redemptions, and promotion redemptions.
- `get_partner_campaign_roi` derives engagement score and conversion rate from campaign outcomes.
- `get_partner_allocation_roi` derives outcome value and budget efficiency from allocations/outcomes.
- `get_partner_network_benchmark` derives partner-level check-in/review rates and engagement score.

These are therefore a coherent Enterprise Partner Analytics capability, not orphaned RPCs. The Architecture should expose one canonical enterprise/partner analytics boundary and keep the underlying outcome/metric tables authoritative.

### 2. Security review found one concrete partner-function concern

`get_enterprise_partner_network`, `get_partner_campaign_roi`, and `get_partner_allocation_roi` include an owner-business membership check against `auth.uid()`.

`get_partner_network_benchmark` is also `SECURITY DEFINER`, but its definition does **not** include the equivalent owner-business authorization predicate. It filters by `network_id` and aggregates campaign outcomes without verifying that the caller belongs to the network owner business.

This is a Production security finding, not an Architecture gap. Do not work around it in the client. It should be remediated through the normal Supabase security/migration process after the architecture pass, with verification afterward.

### 3. Fleet has multiple authoritative operational datasets, but no controller-authored metric definition model

Production has distinct Fleet fact/projection stores:

- `fleet_performance_events` — event-level operational facts with driver, vehicle, route, event type, timestamp, location, and metric payload.
- `fleet_vehicle_daily_metrics` — vehicle/day derived operational metrics such as miles, engine hours, trips, fuel, energy, idle, utilization, faults, and maintenance due.
- `fleet_driver_scorecards` — driver/day scorecard projections containing safety, efficiency, route-completion scores and underlying safety-event counts.
- `fleet_metric_snapshots` — business/day fleet summary projections such as active vehicles, completed routes/stops, coverage score, average stop distance, and time saved.

The existing `fleet_dashboard_summary` / `fleet_dashboard_summary_v2` functions consume these operational facts and related fleet tables. `fleet_dashboard_summary_v2` also enforces Fleet access before returning the aggregate dashboard.

None of these structures contains the missing controller-authored tuple:

`business -> controller -> metric definition -> goal/threshold -> scoring rule -> scope`

Therefore the earlier conclusion stands: there is no evidence of an existing Fleet metric-definition engine that should be duplicated or mistaken for one of these scorecard/projection tables.

### 4. Business leaderboards are a different primitive

`business_metric_leaderboards` stores materialized business rankings with a fixed `metric`, period, rank, and numeric value.

`refresh_business_metric_leaderboards()` currently materializes a bounded set of business metrics (`check_ins`, `reviews`, `favorites`). `get_business_leaderboard()` independently computes a bounded set of metrics (`check_ins`, `reviews`, `qr_scans`, `favorites`, `rating`).

This is a shared leaderboard/read-model capability, not a configurable Fleet scoring engine. It should remain a downstream consumer of authoritative measurements. It must not become the place where Fleet controllers define metrics or thresholds.

### 5. `feature_catalog.configuration` is a capability-configuration registry, not a Fleet metric-definition registry

Production `feature_catalog` contains machine-readable feature entries with:

- `feature_code`
- name/category
- minimum tier
- enabled state
- JSON `configuration`

The configuration is currently used for feature behavior/access metadata such as geofence distance, required check-in, photo requirements, selected dataset names, and supported metric lists. Fleet entries include `fleet_driver_safety`, `fleet_maintenance`, `fleet_route_optimization`, `fleet_service_opportunities`, `fleet_telemetry_ingestion`, and `fleet_vehicle_utilization`.

This confirms the architecture observation from Batch L: `feature_catalog` is a real backend capability registry and should remain the authority for feature availability/configuration. However, it does **not** currently provide controller-owned metric definitions, goals, thresholds, scoring formulas, or fleet/team/driver scope.

Do not overload `feature_catalog.configuration` into a second semantic system for Fleet scoring. The eventual Fleet business-configuration adapter can reference feature codes and shared measurement primitives while keeping metric-definition state in its own narrowly scoped configuration boundary.

### 6. Notification flow is a complete event -> materialization -> delivery chain

Production separates:

1. `notification_events` — event/audience/payload/dedupe/expiry state.
2. `notifications` — user-facing materialized notification state, including read state.
3. `notification_deliveries` — per-recipient/channel delivery state and retry metadata.
4. push subscription/delivery infrastructure and queue/worker functions.

`publish_fleet_route_notification()` demonstrates the full Fleet integration: authorization -> fleet route update -> notification event -> in-app/push delivery rows -> materialization -> push queueing.

`create_intelligence_notification()` separately demonstrates intelligence-originated notification creation with dedupe/cooldown semantics.

Therefore notifications should be modeled as shared platform infrastructure with Fleet and Intelligence as event producers, not embedded inside either domain.

### 7. Fleet route notifications are already a cross-domain bridge

The Fleet route notification publisher writes both a Fleet route update and a platform notification event, then creates deliveries for business members and the route driver.

This is exactly the kind of bridge the Architecture needs to preserve: Fleet owns the operational event; Notification owns audience/materialization/delivery; the application shell consumes the resulting user notification state.

## Architecture classification

| Capability | Production evidence | Classification | Architecture action |
|---|---|---|---|
| Enterprise partner network | networks, memberships, invitations, status | canonical backend capability | preserve enterprise/partner boundary |
| Partner campaign ROI | campaign outcomes + ROI RPC | canonical derived analytics | expose as enterprise analytics read model |
| Partner allocation ROI | allocations + outcomes + efficiency RPC | canonical derived analytics | expose as enterprise analytics read model |
| Partner network benchmark | benchmark RPC | canonical derived analytics, with auth defect | preserve boundary; remediate authorization |
| Fleet operational facts | performance events, vehicle daily metrics | authoritative/derived measurement layers | keep distinct from controller configuration |
| Fleet driver scorecards | driver/day score records | derived scorecard projection | consume measurements; do not redefine as metric engine |
| Fleet metric snapshots | business/day aggregate | derived fleet projection | dashboard/read-model only |
| Business leaderboards | materialized metric rankings | shared progression/business read model | keep downstream of measurements |
| Feature catalog | feature codes + JSON configuration | capability/entitlement registry | reuse as availability/config authority |
| Fleet controller metrics | no definition/goal/scoring/scope model found | genuinely missing | later add thin Fleet business-configuration adapter |
| Fleet route notifications | route update -> event -> deliveries -> queue | shared platform bridge | preserve cross-domain ownership |
| Intelligence notifications | notification creation + dedupe/cooldown | shared platform bridge | keep Intelligence as producer, Notification as infrastructure |

## Resulting architecture

The reconciled Fleet path is now:

`Fleet operational facts`

`-> existing Fleet calculations / scorecards / snapshots`

`-> shared Measurement / Progression primitives`

`<- Fleet business configuration adapter`

`-> controller goals / thresholds / scoring / scope`

while notifications remain orthogonal:

`Fleet or Intelligence event producer`

`-> notification event`

`-> materialized user notification`

`-> channel delivery`

`-> push/worker infrastructure`

Enterprise partner analytics follows the same read-model principle:

`partner/network/campaign outcomes`

`-> ROI / benchmark / network analytics projections`

`-> Enterprise controller surfaces`

## Gate

**Fleet controller metric-definition capability remains genuinely missing.** Do not build a new metrics engine. Build only the narrow configuration adapter after the shared Measurement/Progression contract is finalized.

**One Production security finding is recorded:** `get_partner_network_benchmark` is `SECURITY DEFINER` without the owner-business authorization predicate present in the neighboring partner analytics functions.

No Production mutations were performed in this batch.

## Next batch

Continue the architecture reconciliation with the remaining high-priority hidden-capability queue: external-data ingestion, Evidence/Quality, route-discovery ownership, entitlement resolution, and telemetry hierarchy. After those contracts are reconciled, perform the full architecture audit before wiring the UI/application shell.
