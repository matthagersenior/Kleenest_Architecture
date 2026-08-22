# Batch AE — Fleet measurement authority and double-counting audit

Date: 2026-08-22

## Confirmed shared gamification authority

`record_gamification_activity(activity, reference_id)` is the current point-awarding authority for the enumerated gamification activities. It validates activity vocabulary, maintains streaks, calculates points, applies streak bonuses, inserts idempotent point transactions when a reference id exists, recomputes profile totals/level/streak, and evaluates badges.

Therefore Fleet must not directly award ordinary gamification points for an event that is also passed to `record_gamification_activity`.

## Measurement vs reward

`record_progression_metric_event` is a separate measurement primitive. It records a metric event, calculates points from the configured `progression_actions` definition when enabled, and can invoke `record_gamification_activity(metric, source_id)`.

A metric can therefore have two effects: a progression measurement record and a gamification reward. Architecture must model measurement and reward as separate effects even when one command currently performs both.

## Current gamification trigger coverage

`gamification_activity_trigger` routes source-table inserts to `record_gamification_activity` for check-ins, location bathroom verifications, published reviews, favorites, published social posts, route completion/stop completion/sharing, and selected analytics events such as QR scans, RSVPs, and shares. It requires an authenticated user and matching row user.

## Fleet implication

Fleet performance events should not be attached to `gamification_activity_trigger` merely to make them measurable. Fleet needs a metric adapter that translates operational facts into configurable metrics without necessarily producing personal gamification rewards.

A controller may want points-like scores, completion percentages, SLA adherence, utilization, quality scores, trends, team rankings, and custom thresholds without those becoming user-level `point_transactions`.

## Recommended architecture

```text
Fleet operational event
        ↓
Fleet performance fact
        ↓
Metric adapter / configured metric definition
        ↓
Shared measurement engine
        ├── metric event / snapshot
        ├── score / KPI projection
        ├── goal / challenge evaluation
        └── optional gamification reward adapter
                                      ↓
                               point transaction
```

The reward branch must be explicitly configured, not an accidental consequence of recording a metric.

## Critical finding

The existing `record_gamification_activity` vocabulary is user-centric. It should not be expanded to arbitrary Fleet metrics merely to reuse the function. The shared lower-level metric/progression framework is the better reusable primitive, with Fleet-specific metric definitions and an optional reward adapter.

## Enterprise metric distinction

`record_enterprise_partner_metric` writes a daily aggregate for an enterprise partner network after business membership authorization. It is a business/enterprise aggregate and does not itself invoke the user gamification reward path. This is a useful precedent for separating organizational performance measurements from individual rewards.

## Architecture decisions

1. Keep Fleet operational facts Fleet-owned.
2. Reuse shared measurement/progression primitives where semantics match.
3. Separate organizational KPI measurement from personal reward points.
4. Never double-count an event through Fleet and gamification paths.
5. Make reward conversion explicit and configurable.
6. Preserve idempotency at event/metric/reward boundaries.
7. Keep business/enterprise aggregates separate from user gamification unless an explicit adapter connects them.
8. Fleet controllers can configure metrics and thresholds; they cannot redefine canonical event facts.

## Next audit

Trace Fleet's actual event writers and scorecard/snapshot calculations, then map each to the shared progression metric vocabulary. The objective is a field-level adapter matrix showing which Fleet metrics can reuse existing primitives and which require genuinely Fleet-specific calculations.

No Production mutation was performed.
