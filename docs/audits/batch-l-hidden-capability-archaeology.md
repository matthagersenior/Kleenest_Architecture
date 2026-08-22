# Batch L — Hidden capability archaeology

Date: 2026-08-22

## Scope

This batch inventories Production Supabase objects that are easy to miss when auditing only obvious app services. It uses the live public schema/function inventory as evidence and classifies capabilities for subsequent GitHub parity work.

## Newly confirmed capability clusters

### Admin / governance

Production exposes a complete admin surface: authorization, overview, pending businesses, reports, account capabilities, business tier/verification, user access, user search, CRUD gateway, and data-integrity summary. These must be a privileged Architecture domain, not mixed into Business or Profile.

### External data / ingestion

Production has external datasets, sources, import jobs, external location records, external observations, OSM ingestion, enrichment, metadata merge, external identity resolution, and public data-catalog search. This is a first-class data-ingestion pipeline and must be separated from user-facing Location CRUD.

### Location quality / evidence

Beyond basic verification, Production contains amenities, amenity observations, observation votes, quality observations/reviews, confidence, conflicts, submissions, verification campaigns, verification targets/points, address backfills, sources, visits, and fixture data. This is a broad Evidence/Quality system rather than a single verification feature.

### Route discovery / navigation

Production contains route plans/stops/events, route discovery sessions/cells/locations, map discovery cache, favorite-route events, route preparation, cache population, completion, and location-route events. Routing therefore consumes and produces shared discovery/location facts and must not be modeled as only a UI directions wrapper.

### Notifications / delivery infrastructure

Production contains notifications, notification events, deliveries, preferences, push subscriptions/deliveries, intelligence notification jobs/deliveries, event materialization, queueing, and worker-secret retrieval. The Architecture notification domain needs a distinction between user notification state, delivery infrastructure, and intelligence-generated jobs.

### Family / entitlement system

Production contains family accounts/groups/members/invites plus `family_has_premium_access`, `get_effective_consumer_tier`, product entitlements, subscription summaries, and account service entitlements. Entitlement resolution is a shared cross-domain dependency and should be evaluated before feature availability.

### Social

Production contains social posts, comments, likes, saves, reports, activity, challenge entries, and follows. The social domain therefore shares progression, notification, moderation, and identity dependencies.

### Gamification / progression

Production includes badges, levels, streaks, progression games/actions/challenges/metric events, point/reward transactions, contributor milestones/reputation, leaderboards, and business progression/perks. This should remain a shared progression engine, not feature-local reward code.

### Business growth / commercial operations

The live function inventory is significantly larger than simple campaign CRUD. It includes campaigns, contests, events, promotions, QR, media, partnerships, preferred-location access, single-use access, search boosts, engagement attribution, occupancy, visitor analytics, ROI, growth signals, member management, and location-scoped intelligence.

## Important architectural observations

1. **`feature_catalog` and `feature_access_events` indicate a capability/entitlement registry already exists in the backend.** Architecture should eventually map its machine-readable capability registry to this authority rather than maintaining a second unrelated feature list.
2. **`location_feature_summary`, `location_health`, `location_intelligence_snapshot`, `restroom_intelligence`, and `user_progression_metric_summary` are derived read models.** They should be treated as projections/consumers, not authoritative write stores.
3. **`public_locations` and `nearby_locations(_enriched)` are read models/functions over canonical location data.** Maps/Search should consume them rather than maintaining another location catalog.
4. **`app_profile`, `my_profile`, and `public_profiles` are projections of profile state.** Profile architecture should define which is private, authenticated, and public instead of treating all as interchangeable.
5. **There are multiple analytics surfaces** (`analytics_events`, `data_feature_events`, `feature_access_events`, `business_*_analytics`, `enterprise_*_events`, fleet events). These need an explicit telemetry hierarchy so the Architecture does not create competing analytics authorities.
6. **There are multiple demo/test provisioning functions.** They must be isolated from production capability contracts and never become accidental runtime dependencies.

## High-priority hidden-feature queue

1. Admin/governance
2. External data ingestion and identity resolution
3. Evidence/quality/observation network
4. Route discovery and navigation
5. Family/entitlement resolution
6. Notification/delivery infrastructure
7. Social/moderation
8. Analytics/event hierarchy
9. Demo/test infrastructure isolation

## Gate

No production mutation was performed. This batch is discovery/classification only. The next pass should map these clusters to concrete GitHub files/services and identify missing Architecture contracts, duplicates, legacy surfaces, and dependencies.