# Batch U — Authority findings from implementation tracing

Date: 2026-08-22

## Confirmed findings

### `recordRewardEvent` is telemetry, not a reward writer

`src/services/events.js` implements `recordRewardEvent()` through the `record_data_feature_event` RPC. The live RPC requires authentication and inserts into `data_feature_events` with a minute-based deduplication key.

Classification: `feature_event` / telemetry. It is not itself a points-awarding command, although it may duplicate server feature-event capture for the same domain action.

### `record_progression_metric_event` is reward-capable

The live function checks `progression_actions`. When the metric is enabled it calculates points and explicitly calls `record_gamification_activity(metric, source_id)` before inserting the progression metric event.

Therefore a caller of this RPC can award progression/gamification points. It is not merely telemetry.

### Contest entry is a confirmed authority conflict

GitHub `submitContestEntry()` calls `submit_contest_entry` and then `recordProgressionMetric({ metric: 'contest_entry', sourceType: 'contest', sourceId: contestId })`.

Production has `gamification_activity_trigger` on `contest_entries`, and that trigger calls `record_gamification_activity('contest_entry', new.contest_id)`.

One contest entry can therefore reach gamification through both the table trigger and the client-follow-up progression RPC. This is now a **confirmed duplicate reward path** unless the progression metric is deliberately being used for a separate, proven purpose.

### Reviews have different follow-up semantics

`createReview()` uses the canonical `create_review` RPC and then calls `recordReviewSubmitted`, `recordBusinessEngagement`, and `syncReviewRewards`.

- `recordReviewSubmitted` writes a `review_submitted` feature event and bridges a live-network event; it is not a points writer.
- `recordBusinessEngagement` calls `record_business_engagement_attribution` behind the business `engagement_attribution` entitlement; this is business attribution, not inherently duplicate gamification.
- `syncReviewRewards` reads `review_rewards_summary` and publishes UI state; its `recordRewardEvent` follow-up is telemetry, not direct point awarding.

These should not be removed as one block.

## Architecture decision

The runtime contract should distinguish:

- `canonical_mutation`
- `server_projection`
- `reward_command`
- `feature_event`
- `business_attribution`
- `read_sync`
- `live_event_bridge`

A function named `record*` cannot be classified from its name alone.

## Action queue

1. Redesign/remove the contest client progression call while preserving any legitimate metric telemetry; the database contest trigger remains the authoritative reward path.
2. Audit every caller of `record_progression_metric_event` for the same trigger-plus-RPC reward duplication pattern.
3. Compare client feature-event calls against `_kleenest_capture_feature_event` before consolidating telemetry.
4. Preserve business attribution and reward-summary synchronization until their contracts are fully mapped.

No Production mutation was performed in this batch.
