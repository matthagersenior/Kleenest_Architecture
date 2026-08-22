# Batch S — Data authority and duplicate-path audit

Date: 2026-08-22

## Confirmed cross-cutting trigger surfaces

Production currently has 29 public relational tables with non-internal triggers. Several domain facts have multiple automatic side effects.

### Reviews

`reviews` has six triggers:

- `_kleenest_capture_feature_event`
- `gamification_activity_trigger`
- `notify_business_review`
- `process_review_counter`
- `refresh_location_rating`
- `set_updated_at`

Therefore review creation is a high-risk consolidation point. A new Architecture review command must write the canonical review once and allow these server-side projections/events to execute. Do not duplicate counter/rating/gamification/notification writes in the client.

### Check-ins

`check_ins` has three triggers:

- `_kleenest_capture_feature_event`
- `gamification_activity_trigger`
- `process_check_in`

The canonical check-in RPC should remain the authority; client-side reward/event duplication would create double effects.

### Route events

`route_events` has both feature-event capture and gamification triggers. This is another event-producing mutation where client-side analytics/reward duplication should be prohibited.

### Bathroom verification

`location_bathroom_verifications` has both `process_bathroom_verification` and `gamification_activity_trigger`. Separately, `location_verification_observations` refreshes the location verification summary. These are related but distinct pipelines; Architecture must not merge them without tracing their callers and intended semantics.

### Amenity observations

`location_amenity_observations` has feature-event capture plus `apply_user_amenity_confirmation`. External observations use a separate `external_observations` → `apply_external_amenity_observation` pipeline. User evidence and external evidence therefore have different authority paths.

### Feature events

`_kleenest_capture_feature_event` is attached to 12 tables. This is a centralized cross-cutting event capture mechanism. Frontend feature services should not independently emit equivalent canonical feature events unless explicitly required.

### Gamification

`gamification_activity_trigger` is attached to nine tables, including check-ins, reviews, routes, social posts, favorites, contest entries, promotions, bathroom verifications, and analytics events. This is a major source of potential double-award risk if client code also performs direct reward operations.

## Authority rules for Architecture

1. Canonical domain mutation occurs once.
2. Database triggers own automatic projections/side effects unless a documented server RPC owns them explicitly.
3. Client services should not reproduce trigger behavior.
4. Event capture should have one canonical emission path per domain event.
5. Gamification should have one authoritative award path per activity.
6. Related observation systems must remain separate until their semantics and callers are reconciled.
7. Read models/counters/ratings should be treated as projections, not independent sources of truth.

## Highest-risk duplicate-path review queue

- review creation vs manual rating/counter updates
- check-in creation vs direct reward/event calls
- route event creation vs direct gamification/event calls
- bathroom verification vs observation-summary updates
- user amenity confirmation vs external amenity observation
- notification creation vs direct push queueing
- feature-event capture vs frontend analytics/event emission

## Status

No Production mutation was performed. This audit establishes the rules to use during wiring and refactoring. Before changing any duplicate path, trace the exact GitHub caller and Supabase function/trigger chain.
