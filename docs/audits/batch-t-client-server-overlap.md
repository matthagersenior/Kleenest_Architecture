# Batch T — Client/server overlap audit

Date: 2026-08-22

## Confirmed findings

### Reviews

`src/services/reviews.js` uses the server-authoritative `create_review` RPC, then performs client-side follow-up calls including `recordReviewSubmitted`, `recordBusinessEngagement`, and reward synchronization. The reward synchronization path reads `review_rewards_summary`; it is not itself proven to award the review. `recordRewardEvent` remains an overlap candidate because its exact mutation semantics require further tracing.

**Classification:** canonical review mutation = server authoritative; reward summary = read/sync; review/business/reward follow-ups = investigate before removal.

### Progression

`src/services/progression.js` exposes explicit RPC writers:

- `record_progression_action`
- `record_gamification_activity`
- `record_progression_metric_event`
- `complete_progression_challenge`
- `evaluate_user_badges`

These are legitimate explicit progression commands, but their callers must be checked against automatic database gamification triggers before they are invoked for the same domain event.

### Contests

`submitContestEntry()` calls the canonical `submit_contest_entry` RPC and then separately calls `recordProgressionMetric` with `contest_entry`. Production also has `gamification_activity_trigger` on `contest_entries`.

**Classification:** confirmed overlap candidate. The Architecture rewrite must determine whether `record_progression_metric_event` is supplemental metric telemetry or duplicates the contest gamification/progression side effect. Do not blindly retain both as independent reward paths.

### Check-ins

The repository has an explicit server-authoritative `create_check_in` RPC and the associated migration wires server-side check-in processing. Exact client follow-up reward/event callers were not found by the current repository search, so no removal is justified from this batch.

### Bathroom/amenity/route paths

Current exact-text GitHub searches did not establish direct client writers for `location_bathroom_verifications` or `route_events`. This is not evidence that the features are absent; the current connector index may not expose every caller. Keep these as unresolved until runtime/service call chains are fetched directly.

## Rules applied

- Do not delete a client call solely because a similarly named trigger exists.
- Do not assume progression metric recording equals reward awarding.
- Prefer server-authoritative domain RPCs for canonical mutations.
- Keep read/sync calls that hydrate UI state.
- Flag any client-side command that follows a trigger-owned mutation and writes the same conceptual fact.

## Highest-priority follow-up

1. Trace `recordRewardEvent` to its exact Supabase mutation.
2. Trace `recordReviewSubmitted` and `recordBusinessEngagement`.
3. Trace `record_progression_metric_event` and compare its writes to contest gamification.
4. Trace all callers of `record_gamification_activity`.
5. Trace check-in, route, amenity, and bathroom client services directly rather than relying on repository search hits.

No Production mutation was performed.
