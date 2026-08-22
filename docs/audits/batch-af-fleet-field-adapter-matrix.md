# Batch AF — Fleet field-level metric adapter matrix

Date: 2026-08-22

## Source facts confirmed in Production

`fleet_performance_events` is the event-level operational/performance fact table. It identifies driver, vehicle, route, event type, time/location, arbitrary event metrics, and an optional network event id.

`fleet_driver_scorecards` is a daily driver-level projection containing safety, efficiency, route-completion, idle, harsh-braking/acceleration, speeding, collision, and seatbelt measures.

`fleet_metric_snapshots` is a daily business/fleet-level projection containing active vehicles, completed routes/stops, restroom coverage, stop distance, and estimated time saved.

`business_metric_leaderboards` is a period-bounded business metric projection with rank and value.

`business_progression_events` is a business/user-scoped event record with event code, points, and metadata. It must remain separate from ordinary Fleet KPI measurement unless an explicit adapter connects them.

## Adapter matrix

| Fleet metric/fact | Shared framework fit | Recommended treatment |
|---|---|---|
| route completion | **High** | map to configurable metric; preserve route event as source fact |
| stops completed | **High** | configurable count metric |
| active vehicles | **High** | aggregate KPI, not user reward by default |
| restroom coverage score | **High** | configurable quality KPI |
| estimated time saved | **High** | aggregate operational KPI |
| average stop distance | **High** | numeric efficiency metric |
| safety score | **Medium** | keep Fleet scorecard calculation authoritative; expose score as a metric |
| efficiency score | **Medium** | keep Fleet calculation authoritative; expose as metric |
| idle minutes | **High** | metric with direction/threshold semantics |
| harsh braking / acceleration | **High** | event/count metric |
| speeding events | **High** | event/count metric; potential alert/threshold input |
| collision events | **High** | event/count metric; high-severity operational fact |
| seatbelt events | **High** | event/count metric |
| arbitrary `metrics` JSON on performance events | **Conditional** | cannot be automatically promoted to public metrics; requires controller-defined metric schema/allowlist |

## Critical distinction

A metric's **source fact**, **calculation**, and **controller presentation** must remain separate.

```text
fleet_performance_events
        ↓
collision_events = count(event_type = collision)
        ↓
Fleet metric definition
        ↓
controller threshold / goal
        ↓
alert, KPI, score, or optional reward
```

The controller should configure the interpretation; it should not rewrite the collision events.

## Scorecard handling

Safety and efficiency scores should not be reimplemented in the shared progression engine merely because they are metrics. The Fleet scorecard remains authoritative for the calculation. The shared framework can consume the resulting score as a measurable value.

This avoids semantic drift between the established Fleet score and a second generic formula.

## Leaderboard handling

`business_metric_leaderboards` is a projection. It should not become a second source of metric truth. A future configurable leaderboard should consume canonical metric values/aggregates and preserve business scope and period boundaries.

## Directionality requirement

The shared metric definition must support whether higher or lower is better. This is essential because higher route completion/safety/efficiency/time saved may be better, while higher idle minutes, collision, speeding, or harsh-event counts are generally worse.

Therefore a generic numeric metric without direction/goal semantics is insufficient for Fleet controllers.

## Custom controller metrics

Fleet's `metrics` JSON on events is useful for extensibility but must not automatically become executable configuration. Architecture should define metric key, source event/fact, aggregation, unit, direction, valid scope, time window, threshold/goal semantics, optional reward mapping, and authorization before a controller-defined metric can affect dashboards, scores, alerts, or rewards.

## Architecture conclusion

Fleet can reuse the shared measurement framework extensively, but **Fleet remains the authority for Fleet-domain calculations and operational facts**. The shared framework becomes the configurable measurement/goal/reward layer above those facts.

No Production mutation was performed.
