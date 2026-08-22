# Production Capability Inventory

Snapshot taken from Production Supabase project `ssgesjzdvdsqacdtasje` on 2026-08-22.

This is a capability map, not a claim that every table is a client-facing feature. Tables marked by comments as public/read-only/protected must retain that boundary.

## 1. Identity, access, pricing

- `profiles`
- `subscription_plans`
- `subscriptions`
- `account_service_entitlements`
- `user_feature_entitlements`
- `feature_catalog`
- `feature_access_events`
- `pricing_catalog` — canonical pricing read model
- `pricing_plans` — compatibility/read-only catalog
- `pricing_family_catalog_v1`
- `demo_identity_registry`
- `account_deletion_requests`

**Canonical domain:** `identity`, `entitlements`, `pricing`

## 2. Locations, places, quality and discovery

- `locations`
- `places`
- `place_categories`
- `location_hours`
- `amenities`
- `location_amenities`
- `location_fixtures`
- `location_photos`
- `location_sources`
- `location_ingestion_jobs`
- `location_confidence`
- `location_feature_summary`
- `location_amenity_observations`
- `location_quality_observations`
- `location_observation_votes`
- `location_observations`
- `location_data_conflicts`
- `location_address_backfills`
- `location_submissions`
- `location_claims`
- `location_filter_events`
- `location_discovery_sessions`
- `map_discovery_cache`
- `external_data_sources`
- `external_location_records`
- `external_observations`
- `external_data_datasets`
- `external_import_jobs`

**Canonical domain:** `locations`

## 3. Location verification and contributor quality

- `location_bathroom_verifications`
- `location_verification_points`
- `location_verification_campaigns`
- `location_verification_targets`
- `location_verification_observations`
- `location_quality_reviews`
- `contributor_reputation`
- `contributor_milestones`
- `review_amenity_feedback`

**Canonical domain:** `location-quality`

## 4. Maps, routing and offline

- `route_plans`
- `route_stops`
- `route_events`
- `location_route_events`
- `route_discovery_sessions`
- `route_discovery_locations`
- `route_discovery_cells`
- `offline_packs`
- `offline_pack_locations`
- `offline_pack_businesses`
- `offline_pack_events`
- `user_location_sessions`
- `location_visits`

**Canonical domain:** `maps`, `routing`, `offline`

## 5. Consumer location interaction

- `qr_codes`
- `qr_attribution_events`
- `qr_redemptions`
- `check_ins`
- `reviews`
- `review_photos`
- `review_likes`
- `favorites`
- `location_favorites`
- `location_observations`

**Canonical domain:** `checkins`, `reviews`, `favorites`, `qr`

## 6. Social

- `follows`
- `social_posts`
- `social_post_likes`
- `social_post_comments`
- `social_post_saves`
- `social_post_reports`
- `social_activity`
- `social_challenge_entries`
- `messages`
- `reports`

**Canonical domain:** `social`, `messaging`, `moderation`

## 7. Progression, rewards and contests

- `badges`
- `user_badges`
- `point_transactions`
- `reward_transactions`
- `level_definitions`
- `user_streaks`
- `progression_actions`
- `progression_games`
- `progression_challenges`
- `progression_metric_events`
- `contests`
- `contest_entries`

**Canonical domain:** `progression`, `rewards`, `contests`

## 8. Families

- `family_groups`
- `family_members`
- `family_accounts`
- `family_invites`

**Canonical domain:** `family`

## 9. Business

- `businesses`
- `business_members`
- `business_campaigns`
- `business_events`
- `event_rsvps`
- `promotions`
- `promotion_redemptions`
- `membership_clubs`
- `club_memberships`
- `business_certifications`
- `certification_tiers`
- `business_earned_perks`
- `business_progression_events`
- `business_geofences`
- `business_search_boosts`
- `business_metric_leaderboards`
- `business_engagement_attributions`

**Canonical domain:** `business`

## 10. Partner programs

- `partner_programs`
- `partner_agreements`
- `partner_program_memberships`
- `partner_program_locations`
- `preferred_location_activations`
- `preferred_usage_events`

**Canonical domain:** `partners`

## 11. Enterprise

- `enterprise_partner_networks`
- `enterprise_partner_network_members`
- `enterprise_partner_network_metrics`
- `enterprise_partner_campaigns`
- `enterprise_partner_campaign_outcomes`
- `enterprise_partner_allocations`
- `enterprise_engagement_events`
- `enterprise_intelligence_events`

**Canonical domain:** `enterprise`

## 12. Fleet

- `fleet_vehicles`
- `fleet_drivers`
- `fleet_routes`
- `fleet_alerts`
- `fleet_metric_snapshots`
- `fleet_operational_events`
- `fleet_maintenance_records`
- `fleet_driver_scorecards`
- `fleet_vehicle_daily_metrics`
- `fleet_route_updates`
- `fleet_performance_events`

**Canonical domain:** `fleet`

## 13. Intelligence and notifications

- `intelligence_notification_deliveries`
- `intelligence_notification_jobs`
- `intelligence_action_links`
- `notification_push_subscriptions`
- `notification_preferences`
- `notification_push_deliveries`
- `notification_events`
- `notification_deliveries`
- `notifications`
- `live_network_events`
- `business_growth_signals`
- `qr_intelligence_events`

**Canonical domain:** `intelligence`, `notifications`, `live-network`

## 14. Analytics and data features

- `analytics_events`
- `data_feature_events`
- `user_engagement_daily`

**Canonical domain:** `analytics`

## 15. Administration and support

- `admin_capability_audit`
- `user_feedback`
- `support_requests`
- `ad_placements`

**Canonical domain:** `admin`, `support`

## Active Edge Functions observed

- `ingest-map-candidates` (JWT disabled)
- `admin-tools`
- `maps-ingest`
- `public-data-catalog`
- `public-data-ingest`
- `public-data-ingest-v2`
- `admin-user-control`
- `public-data-ingest-v3`
- `deliver-intelligence-notification`
- `generate-intelligence-notifications`
- `backfill-location-addresses`
- `deliver-push-notification` (JWT disabled)
- `market-bathroom-ingest`
- `network-source-ingest`
- `market-bathroom-ingest-v2`
- `datagov-network-ingest-v1`
- `market-bathroom-ingest-v3`
- `market-bathroom-ingest-v4`
- `public-data-ingest-v4`
- `market-bathroom-ingest-v5`

The versioned ingest functions are evidence of backend capability, but they should **not** automatically become separate frontend services. The Architecture layer should expose one canonical ingestion capability where appropriate.

## Initial architectural conclusion

The Production schema contains a broad platform, not a single CRUD application. The first canonical boundaries are therefore:

`identity → entitlements → locations → maps/routing → checkins/reviews/favorites → social → progression/rewards → business → enterprise → fleet → intelligence/notifications → admin/support`

The next audit determines which of these capabilities already have a verified consumer in `Kleenest_App`, which are partial, and which are backend-only.
