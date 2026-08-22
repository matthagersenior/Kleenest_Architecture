# Batch AD — Fleet ↔ Gamification/Social performance framework audit

Date: 2026-08-22

## Confirmed Production capability overlap

Production already contains a shared progression/gamification framework alongside a substantial Fleet performance system. The audit does **not** assume they are interchangeable; it identifies the primitives that appear structurally reusable.

### Shared progression primitives

The shared framework contains:

- `progression_actions` — configurable action definitions with code, label, points, and enabled state.
- `progression_metric_events` — user-scoped metric events with source type/id, quantity, points, and metadata.
- `user_progression_metric_summary` — aggregate metric quantity, points, event count, and last occurrence.
- `progression_challenges` — configurable targets, rewards, periods, and `metrics_config`.
- `progression_games` — configurable rules, rewards, difficulty, enabled state, and `metrics_config`.
- `record_progression_action` and `record_progression_metric_event` — server commands for recording progression activity.
- `get_progression_summary` and `gamification_dashboard` — read surfaces.

This is a strong candidate for the **configurable measurement engine** you described for Fleet controllers.

## Fleet already has its own performance data model

Fleet currently contains:

- `fleet_operational_events`
- `fleet_performance_events`
- `fleet_driver_scorecards`
- `fleet_vehicle_daily_metrics`
- `fleet_metric_snapshots`
- `business_metric_leaderboards`
- `business_progression_events`
- `fleet_alerts`
- Fleet drivers, vehicles, routes, maintenance records, and service opportunities.

There are also dedicated Fleet dashboard and status commands.

Therefore the correct architecture is **not** to replace Fleet's domain model with gamification tables wholesale.

## Recommended two-layer model

```text
Canonical operational events
        ↓
Fleet performance facts / snapshots
        ↓
Shared Measurement & Progression Engine
        ↓
Fleet-configured metrics / goals / scores / leaderboards
        ↓
Fleet Controller UI
```

The shared engine should consume canonical Fleet events through an adapter/metric-definition layer. Fleet remains the authority for operational facts such as driver status, vehicle state, route state, maintenance, and fleet-specific performance observations.

## Why this is important

Fleet is unique because it is a customizable user/business platform. A controller should be able to choose/configure what performance means for their organization without creating a second measurement architecture.

Examples of reusable framework primitives:

- metric definitions
- action definitions
- targets/goals
- time periods
- points/scoring
- progression summaries
- challenge rules
- configurable metadata/rules
- leaderboards

Fleet-specific facts should remain domain-owned:

- vehicle telemetry/operational state
- route completion
- driver/vehicle assignments
- maintenance
- fleet alerts
- fleet service opportunities
- controller permissions

## Critical interoperability question

There are two existing progression/event paths:

1. `progression_metric_events` / `record_progression_metric_event`
2. `business_progression_events`

And Fleet has separate `fleet_performance_events`.

Before wiring, we must determine whether `business_progression_events` is already an intentional business-scoped adapter into the progression framework or whether it represents a competing reward/measurement pipeline.

Likewise, `business_metric_leaderboards` may be a business-specific projection that can remain as a read model while the underlying metric definitions/scoring become shared.

## Architecture decisions

1. Fleet is a customizable platform, not merely a feature.
2. Fleet operational data remains Fleet-domain authoritative.
3. The gamification/progression framework should be evaluated as the shared configurable measurement engine.
4. Do not duplicate metric/goal/scoring primitives merely because the consumer is Fleet.
5. Do not force raw Fleet operational facts into user gamification semantics without an explicit metric adapter.
6. Preserve business/fleet authorization and scope on every metric.
7. A controller-configured metric must not mutate the underlying operational fact.
8. Leaderboards and dashboards should be projections of authoritative events/metrics, not alternate event authorities.

## Next audit

Trace the actual definitions and call graph for:

- `business_progression_events`
- `record_enterprise_partner_metric`
- `business_metric_leaderboards`
- `fleet_performance_events`
- `fleet_metric_snapshots`
- `fleet_driver_scorecards`
- `gamification_activity_trigger`
- `record_progression_metric_event`

The goal is to identify exactly where a shared metric adapter can be introduced without double-counting or changing existing reward semantics.

No Production mutation was performed.
