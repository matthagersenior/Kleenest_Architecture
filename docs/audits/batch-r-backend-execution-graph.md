# Batch R — Backend execution graph

Date: 2026-08-22

## Production trigger graph

The live public schema contains a substantial event-driven backend. Important trigger chains include:

- `check_ins` → `process_check_in` + `gamification_activity_trigger` + feature-event capture.
- `external_observations` → `apply_external_amenity_observation`.
- `location_amenity_observations` → feature-event capture + `apply_user_amenity_confirmation`.
- `location_bathroom_verifications` → `process_bathroom_verification` + gamification.
- `live_network_events` → `queue_intelligence_notification_jobs`.
- `notifications` → `enqueue_notification_push_delivery`.
- `reviews` → business notification + counters + location-rating refresh + gamification + feature-event capture.
- `route_events` → gamification + feature-event capture.
- `social_posts` / favorites / contest entries / promotions → gamification activity.
- `locations` → geometry synchronization, place synchronization, updated-at, and growth-cap enforcement.
- `messages` → new-message notification.
- `profiles` → demo-membership provisioning.

## Scheduled execution

Production currently has four active scheduled jobs:

1. `kleenest-maps-st-louis` — every six hours at minute 17 → `maps-ingest` Edge Function.
2. `kleenest-maps-kansas-city` — every six hours at minute 47 → `maps-ingest` Edge Function.
3. `kleenest-intelligence-notification-worker` — every minute → `process_intelligence_notification_jobs(50)`.
4. `kleenest-intelligence-action-worker` — every five minutes → `process_intelligence_action_jobs(50)`.

This establishes that Maps ingestion and Intelligence workers are active backend capabilities, not dormant migrations.

## Architectural implications

### Event capture is cross-cutting

`_kleenest_capture_feature_event` is attached to many product tables. Architecture must treat feature-event capture as a cross-cutting event pipeline, not duplicate analytics/event emission in every frontend feature.

### Gamification is trigger-driven

Multiple domains automatically invoke `gamification_activity_trigger`. Client code should not independently award the same activity unless an explicit server contract says so.

### Notifications are multi-stage

The live graph is effectively:

`domain event → notification/event queue → notification materialization/delivery → push delivery`.

This confirms that notification delivery functions are infrastructure and should not be treated as ordinary client capabilities merely because an RPC exists.

### Maps is an active scheduled ingestion system

Two market-specific cron jobs invoke the `maps-ingest` Edge Function. Maps therefore has a backend ingestion lifecycle independent of the UI discovery/read path.

### Intelligence is an active worker system

The notification and action queues have dedicated scheduled workers. Intelligence action/notification APIs should be modeled as asynchronous job systems, not synchronous UI RPCs.

## Hidden-feature classifications from this batch

- **Active worker-backed capability:** Maps ingestion.
- **Active worker-backed capability:** Intelligence notifications.
- **Active worker-backed capability:** Intelligence actions.
- **Cross-cutting infrastructure:** feature-event capture.
- **Cross-cutting infrastructure:** gamification activity triggers.
- **Cross-cutting infrastructure:** notification push delivery.
- **Projection/reconciliation infrastructure:** location verification summary, review counters/rating refresh, place synchronization.
- **Potential legacy/demo infrastructure:** automatic demo membership provisioning after profile creation.

## Gate

No Production mutation was performed. The Architecture runtime must model triggers, cron jobs, and workers as first-class dependencies before feature wiring begins. A feature is not fully wired merely because its UI can call a Supabase RPC; its downstream triggers, jobs, projections, notifications, and event consumers must also be represented.
