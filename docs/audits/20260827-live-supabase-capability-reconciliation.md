# Kleenest Live Supabase Capability Reconciliation — 2026-08-27

## Authority
- Product/runtime source: `main` in `matthagersenior/Kleenest_Architecture`.
- Backend authority: Supabase project `ssgesjzdvdsqacdtasje`.
- Rule: an exposed capability is not complete until it terminates in authoritative persisted state and propagates through the canonical runtime.

## Live capability inventory

The live public function catalog was inspected on 2026-08-27. Relevant backend capabilities include:

### Discovery / intelligence
- `semantic_location_search`
- `search_locations`
- `get_location_recommendation_summary`
- `rank_location_recommendation`
- `get_public_restroom_intelligence`
- `record_location_discovery_event`
- `record_location_filter_event`
- `record_location_route_event`
- `record_favorite_route_event`
- `location_engagement_metrics`
- `location_favorite_route_metrics`
- `record_data_feature_event`

### Intelligence notifications / realtime
- `create_intelligence_notification`
- `publish_intelligence_location_event`
- `publish_location_notification`
- `publish_live_network_event`
- `list_public_live_network_events`
- `resolve_nearby_notification_recipients`
- `queue_intelligence_notification_jobs`
- `process_intelligence_notification_jobs`
- `queue_notification_delivery`
- `queue_push_deliveries_for_notification`
- `send_prioritized_notification_batch`
- `materialize_notification_event`
- `user_notifications`
- `mark_notification_read`
- `mark_all_notifications_read`
- `register_notification_push_subscription`
- `remove_notification_push_subscription`

### Business growth / analytics
- `business_summary_analytics`
- `business_growth_analytics`
- `business_visitors_analytics`
- `business_engagement_analytics`
- `business_location_analytics`
- `business_location_metrics`
- `business_location_scoped_analytics`
- `business_review_analytics`
- `business_qr_analytics`
- `business_campaign_analytics`
- `business_promotion_analytics`
- `business_rewards_analytics`
- `business_roi_analytics`
- `business_benchmark_analytics`
- `business_partner_analytics`
- `business_media_analytics`
- `business_occupancy_analytics`
- `business_event_analytics`
- `business_event_detail`
- `business_amenity_feedback_analytics`
- `business_send_custom_notification`
- `business_create_event`
- `business_manage_event`

### Fleet operations / intelligence
- `fleet_dashboard_summary_v2`
- `fleet_service_opportunities_for_business`
- `fleet_complete_maintenance`
- `fleet_create_maintenance`
- `fleet_create_route`
- `fleet_create_vehicle`
- `fleet_create_driver`
- `fleet_resolve_alert`
- `fleet_set_*_status`
- `fleet_update_*`
- `record_fleet_operational_event`
- `publish_fleet_route_notification`
- `create_fleet_metric_definition`
- `update_fleet_metric_definition`
- `get_fleet_metric_capabilities`
- `get_fleet_metric_configuration`
- `get_fleet_metric_values`
- `get_fleet_leaderboard`
- `get_fleet_network_leaderboard`
- `refresh_business_metric_leaderboards`
- `assign_fleet_metric`

### Enterprise / network intelligence
- `create_enterprise_partner_network`
- `create_enterprise_partner_campaign`
- `activate_enterprise_partner_campaign`
- `pause_enterprise_partner_campaign`
- `enterprise_update_network`
- `enterprise_update_campaign`
- `enterprise_list_network_members`
- `enterprise_list_network_campaigns`
- `enterprise_list_partner_businesses`
- `enterprise_list_owned_networks`
- `record_enterprise_partner_metric`
- `record_enterprise_partner_campaign_outcome`
- `get_enterprise_partner_network`
- `set_enterprise_partner_status`
- `invite_enterprise_partner`

### Reporting / automation
- `reporting_build_payload`
- `reporting_next_run`
- `reporting_schedule_init`
- `run_due_reporting_schedules`
- `admin_list_reports`

### Engagement / progression / offline
- `quest_dispatch_event`
- `record_progression_metric_event`
- `record_geofence_event`
- `create_gps_geofence_notification`
- `queue_offline_pack_event`

### Public data / ingestion
- `search_public_data_catalog`

### Feature telemetry / governance
- `_kleenest_capture_feature_event`
- `admin_list_activity_events`
- `admin_user_search`

## Capability state model

| Capability | Backend | Runtime/UI | State |
|---|---|---|---|
| Semantic discovery | Yes | Yes | INTEGRATED |
| Recommendation intelligence | Yes | Yes | INTEGRATED |
| Intelligence action execution | Yes | Yes | INTEGRATED |
| Intelligence notifications | Yes | Yes | INTEGRATED |
| Push notification delivery | Yes | Partial | NEXT SLICE |
| Business custom notifications | Yes | Yes | INTEGRATED |
| Business growth analytics | Yes | Partial | NEXT SLICE |
| Business ROI/benchmark analytics | Yes | Partial | NEXT SLICE |
| Fleet service opportunities | Yes | Yes/partial | NEXT SLICE |
| Fleet custom metrics | Yes | Yes/partial | NEXT SLICE |
| Enterprise partner intelligence | Yes | Partial | NEXT SLICE |
| Live network events | Yes | Partial | NEXT SLICE |
| Geofence automation | Yes | Partial | NEXT SLICE |
| Offline event queue | Yes | Partial | NEXT SLICE |
| Quest/progression dispatch | Yes | Partial | NEXT SLICE |
| Public data catalog | Yes | Partial | NEXT SLICE |
| Feature telemetry | Yes | Partial | NEXT SLICE |
| Scheduled reporting | Yes | Yes | INTEGRATED |

## Vertical implementation order

### Slice SI-1 — Notification delivery convergence
Canonical outcome → persisted notification → prioritized queue → push delivery → inbox/realtime refresh → delivery telemetry → reporting.

### Slice SI-2 — Business growth intelligence
Growth/visitor/engagement/location/QR/review/campaign/ROI/benchmark functions → normalized business intelligence model → dashboard → actionable recommendation → notification → report.

### Slice SI-3 — Fleet operational intelligence
Dashboard/service opportunities/custom metrics/leaderboards/operational events → prioritized operational signal → action/resolve transition → notification → report.

### Slice SI-4 — Enterprise network intelligence
Partner network/campaign/member metrics → network-level signals → campaign/action transition → notification → ROI report.

### Slice SI-5 — Live network + geofence
Realtime network events + geofence event/notification pipeline → location/user event → notification → progression/analytics state.

### Slice SI-6 — Offline continuity
Offline pack event queue → replay/idempotency → authoritative state transition → realtime reconciliation → notification/progression/reporting refresh.

### Slice SI-7 — Public data intelligence
Catalog search → dataset selection → ingestion job → provenance/freshness/confidence → location intelligence → discovery UI.

### Slice SI-8 — Telemetry / capability governance
Feature events → capability audit → adoption metrics → owner/admin intelligence → automated report.

## Hardening requirements
- Never fabricate client state when an authoritative RPC exists.
- Normalize RPC errors at the service boundary.
- Emit one canonical domain event per authoritative transition.
- Make event handlers idempotent.
- Preserve entitlement checks in the backend and runtime.
- Keep owner/admin routes separately gated.
- Treat notification delivery as a state machine, not a fire-and-forget UI effect.
- Scheduled reporting must use persisted runs and payloads.
- Every new UI control must have a terminating action or explicit read-only status.
- Every capability promoted to the UI must have a testable backend contract.

## Immediate next implementation target
SI-1: close push delivery and delivery telemetry through the existing notification queue/functions, then propagate delivery state into reporting and owner/admin intelligence. This is the highest-leverage existing backend capability that is currently only partially surfaced.
