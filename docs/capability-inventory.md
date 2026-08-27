# Production Capability Inventory

Reconciled 2026-08-27 against Production Supabase project `ssgesjzdvdsqacdtasje` and canonical `main` runtime.

A capability is considered wired only when UI visibility, route/action, service call, authorization/entitlement, persistence, authoritative refresh, error handling and telemetry form one traceable path.

## Canonical domains

### Identity, access, pricing
- `profiles`, `subscription_plans`, `subscriptions`, `account_service_entitlements`, `user_feature_entitlements`, `feature_catalog`, `feature_access_events`
- `pricing_catalog`, `pricing_plans`, `pricing_family_catalog_v1`, `demo_identity_registry`, `account_deletion_requests`

### Locations, quality and discovery
- `locations`, `places`, `place_categories`, `location_hours`, `amenities`, `location_amenities`, `location_fixtures`, `location_photos`, `location_sources`
- `location_ingestion_jobs`, `location_confidence`, `location_feature_summary`, `location_amenity_observations`, `location_quality_observations`, `location_observation_votes`, `location_observations`, `location_data_conflicts`
- `location_address_backfills`, `location_submissions`, `location_claims`, `location_filter_events`, `location_discovery_sessions`, `map_discovery_cache`
- `external_data_sources`, `external_location_records`, `external_observations`, `external_data_datasets`, `external_import_jobs`

### Maps, routing and offline
- `route_plans`, `route_stops`, `route_events`, `location_route_events`, `route_discovery_sessions`, `route_discovery_locations`, `route_discovery_cells`
- `offline_packs`, `offline_pack_locations`, `offline_pack_businesses`, `offline_pack_events`, `user_location_sessions`, `location_visits`

### Consumer / social / progression / family
- QR, check-in, review, favorite and location interaction tables
- social, messaging and moderation tables
- badges, points, rewards, levels, streaks, games, challenges, contests
- family groups, members, accounts and invites

### Business / partners / enterprise
- Business campaigns/events/promotions, clubs, certifications, perks, progression, geofences, search boosts, leaderboards and attribution
- Partner programs, agreements, memberships, locations and preferred activations
- Enterprise partner networks, members, metrics, campaigns, outcomes, allocations, engagement and intelligence events

### Fleet
- `fleet_vehicles`, `fleet_drivers`, `fleet_routes`, `fleet_alerts`, `fleet_metric_snapshots`
- `fleet_operational_events`, `fleet_maintenance_records`, `fleet_driver_scorecards`, `fleet_vehicle_daily_metrics`
- `fleet_route_updates`, `fleet_performance_events`

### Intelligence / notifications / analytics
- `intelligence_notification_deliveries`, `intelligence_notification_jobs`, `intelligence_action_links`
- notification preferences/subscriptions/deliveries/events and `notifications`
- `live_network_events`, `business_growth_signals`, `qr_intelligence_events`
- `analytics_events`, `data_feature_events`, `user_engagement_daily`

### Administration / support
- `admin_capability_audit`, `user_feedback`, `support_requests`, `ad_placements`

## Ingestion boundary

Public discovery and privileged persistence are separate concerns.

- **OSM:** `ingest-map-candidates-v3` is the public discovery broker. Anonymous callers may discover; canonical persistence remains protected by the ingestion RPC.
- **Data.gov:** `datagov-network-ingest-v1` is admin-gated and persists through the same canonical ingestion contract.
- **Canonical source keys:** `osm`, `data_gov`.
- External identities must be stable and provenance must survive normalization.
- Existing physical locations are enriched rather than duplicated.

## Production Edge Functions

Production contains multiple generations of public-data, OSM, market/network ingestion, admin, intelligence, address-backfill and push functions. Legacy generations must not become a second client-facing capability merely because they remain deployed; client paths should converge on the canonical adapters.
