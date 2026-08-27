# Kleenest — 2026-08-27 Supabase Capability Reconciliation

## Authority
- **Canonical application source:** `matthagersenior/Kleenest_Architecture:main`
- **Production backend authority:** Supabase project `ssgesjzdvdsqacdtasje`
- **Reference repositories:** other Kleenest repositories only
- **Rule:** database/Edge Function capability is not a product feature until a canonical runtime/service path exposes it with authorization, persistence, telemetry, refresh, and appropriate realtime/offline semantics.

## Production inventory observed
Production currently exposes a broad platform capability surface beyond the previously audited six domain contracts. The database includes business, fleet, enterprise, consumer, progression, social, notification, offline, external-data, capability-governance, and intelligence models. The public routine catalog includes analytics, CRUD/action RPCs, intelligence, notification, ingestion, search, geospatial, quest, fleet, enterprise, reporting, entitlement, and governance functions.

Active Edge Functions observed include:
- `ingest-map-candidates` / `v2` / `v3`
- `maps-ingest`
- `public-data-catalog`
- `public-data-ingest` / `v2` / `v3` / `v4`
- `admin-tools`
- `admin-user-control`
- `deliver-intelligence-notification`
- `generate-intelligence-notifications`
- `deliver-push-notification`
- `backfill-location-addresses`
- `market-bathroom-ingest` / `v2` / `v3` / `v4` / `v5`
- `network-source-ingest`
- `datagov-network-ingest-v1`
- Stripe checkout/webhook/customer portal functions
- `run-reporting-schedules`

## Capability status taxonomy
- **GREEN — exposed:** canonical UI/runtime path reaches authoritative backend capability.
- **YELLOW — partial:** backend and some runtime support exist, but a meaningful consumer/owner workflow or convergence leg is incomplete.
- **ORANGE — candidate:** backend capability is real and useful, but canonical product exposure is not yet verified.
- **BLUE — infrastructure:** worker/automation capability intentionally has no direct user screen; must still terminate in observable product state where appropriate.
- **RED — drift/false exposure:** UI claims a capability without a verified authoritative backend path.

## Newly reconciled capability matrix

| Supabase capability | Evidence | Product opportunity | Current status | Proposed vertical slice |
|---|---|---|---|---|
| Semantic location search | `semantic_location_search`, `semantic_search_queries` | Natural-language discovery using intent + geography | ORANGE | Search Intelligence |
| Universal location discovery | `prepare_universal_location_discovery`, `location_discovery_sessions/events` | One discovery pipeline shared by map, route, nearby, and membership tiers | YELLOW | Search Intelligence |
| Location recommendation engine | `rank_location_recommendation`, `get_location_recommendation_summary` | Explainable ranked recommendations using distance, trust, freshness, accessibility | ORANGE | Search Intelligence |
| Location trust/confidence | `kleenest_location_confidence`, `get_location_trust_summary`, `location_confidence` | Trust badges, stale-data warnings, confidence explanations | YELLOW | Evidence Intelligence |
| Location feature summary | `refresh_location_feature_summary`, `location_feature_summary` | Unified location health/intelligence card | YELLOW | Evidence Intelligence |
| Bathroom intelligence | `compute_bathroom_intelligence`, `refresh_bathroom_intelligence`, `location_bathroom_intelligence` | Confidence-aware bathroom availability intelligence | YELLOW | Evidence Intelligence |
| Community observation/reputation | `record_location_observation`, `contributor_reputation`, reputation audit | Trusted contributor scoring and evidence quality | YELLOW | Evidence Intelligence |
| Conflict detection | `location_data_conflicts` | Surface conflicting external/community/business claims and resolve them | ORANGE | Data Quality |
| External data provenance | `external_data_sources`, `external_data_datasets`, `external_location_records`, `external_observations` | Dataset provenance, freshness, source comparison, attribution | YELLOW | Data Intelligence |
| Public-data catalog | `public-data-catalog`, `search_public_data_catalog` | Discover useful government/open datasets from the app/admin | YELLOW | Data Intelligence |
| Data ingestion jobs | `public-data-ingest*`, `external_import_jobs`, `location_ingestion_jobs` | Queue, monitor, retry, audit imports | YELLOW | Data Operations |
| Data feature event stream | `data_feature_events`, `record_data_feature_event` | Common telemetry substrate for derived intelligence | ORANGE | Intelligence Core |
| Capability governance | `capability_domain_contracts`, classifications, retirement log, audit runs | Live capability-vs-exposure reconciliation dashboard | GREEN/expand | Governance |
| Capability audit automation | `run_capability_audit`, `capability_classification_summary`, scheduled audit infrastructure | Detect backend/runtime drift automatically | BLUE/expand | Governance |
| Intelligence action links | `intelligence_action_links`, create/execute/complete action RPCs | Signal → actionable workflow | GREEN | Intelligence Core |
| Intelligence notification pipeline | `queue_intelligence_notification_jobs`, processing RPCs, active Edge Functions | Automatic signal notifications with cooldown/deduplication | GREEN | Intelligence Core |
| Prioritized notifications | `send_prioritized_notification_batch` | Business/fleet/admin priority-based notification campaigns | ORANGE | Notifications |
| Notification events/audience routing | `notification_events`, `resolve_nearby_notification_recipients` | User/nearby/follower/business/fleet/enterprise/admin targeting | YELLOW | Notifications |
| Push delivery | push subscription/delivery tables + Edge Function | Reliable push delivery with delivery status | YELLOW | Notifications |
| Geofencing | `business_geofences`, `geofence_events`, create/configure/record RPCs | Location-aware triggers, offers, alerts, quests, conversions | ORANGE | Contextual Automation |
| QR engagement programs | `qr_engagement_programs`, `create_qr_engagement_program` | QR → check-in/reward/promotion/review/event/contest/content/navigation/support/custom | YELLOW | Engagement Automation |
| Live network events | `live_network_events`, publish/list RPCs | Live nearby activity and network pulse | ORANGE | Realtime Network |
| Offline packs | `offline_packs`, location/business snapshots, event queue | Offline map/business/route operation with deterministic sync | YELLOW | Offline Convergence |
| Offline event sync | `offline_pack_events`, `queue_offline_pack_event` | Reliable offline mutation queue and replay | YELLOW | Offline Convergence |
| Route discovery | `route_discovery_sessions/locations/cells`, prepare/populate RPCs | Corridor discovery and route-aware nearby stops | YELLOW | Maps/Routing |
| Route event telemetry | `route_events`, `record_location_route_event` | Route started/completed/shared metrics and social output | YELLOW | Maps/Routing |
| Quest engine | `quests`, `quest_steps`, participation/events + trigger/advance RPCs | Business/fleet/enterprise/admin-created location missions | ORANGE | Progression/Engagement |
| Cross-tier leaderboards | `network_leaderboard_sources/participation`, get functions | Platform/business/fleet/enterprise/location/contributor competition | ORANGE | Progression/Intelligence |
| Business growth signals | `business_growth_signals`, growth analytics | Automated growth opportunities and recommended actions | YELLOW | Business Intelligence |
| Business engagement attribution | `business_engagement_attributions`, funnel/analytics RPCs | Campaign ROI and attributable customer journey | YELLOW | Business Intelligence |
| Business search boosts | `business_search_boosts`, earned perks | Earned/promotional discovery ranking boosts | ORANGE | Business Growth |
| Business earned perks | `business_earned_perks`, progression event RPCs | Turn engagement into business-side benefits | ORANGE | Business Growth |
| Fleet custom metrics | definitions, assignments, values, leaderboards | Owner-defined fleet KPIs with scoring and targets | GREEN | Fleet Intelligence |
| Fleet operational events | `fleet_operational_events`, record RPC | Event-driven fleet analytics and alerts | YELLOW | Fleet Intelligence |
| Fleet maintenance intelligence | maintenance records + vehicle metrics | Maintenance due/cost/vendor/vehicle intelligence | YELLOW | Fleet Intelligence |
| Fleet service opportunities | `fleet_service_opportunities_for_business` | Actionable service recommendations | YELLOW | Fleet Intelligence |
| Enterprise network metrics | network metrics/outcomes/attribution | Partner-network ROI, benchmark and allocation intelligence | GREEN | Enterprise Intelligence |
| Reporting automation | `reporting_schedules`, `reporting_runs`, `reporting_build_payload`, `run_due_reporting_schedules` + Edge Function | Custom scheduled business/fleet/enterprise/admin reports | GREEN | Reporting |
| Report-triggered notifications | notification persistence + reporting scheduler | Report completion/failure notification and history | GREEN | Reporting |
| Account/service entitlements | account/product entitlement RPCs and tables | Precise capability gating by product/service | GREEN | Entitlements |
| Feature access telemetry | `feature_catalog`, `user_feature_entitlements`, `feature_access_events` | Measure locked/allowed/redirected/error paths | GREEN | Governance/Analytics |
| Stripe commerce | checkout/webhook/portal Edge Functions + billing tables | Subscription purchase → entitlement → product access | YELLOW | Commerce |
| Social graph | posts/activity/follows/comments/likes/saves/reports | Share progress, reviews, wins, routes and business outcomes | YELLOW | Social |
| Gamification automation | progression actions/games/challenges + triggers | Automatic points/badges/streak/challenge outcomes | GREEN/YELLOW | Progression |

## High-value unused capability candidates

### 1. Contextual Intelligence Engine
Combine semantic search, location confidence, freshness, recommendation ranking, geofence context, QR signals, live network events, and user preferences into one explainable recommendation surface.

**Outcome:** every recommendation should carry `why`, confidence, freshness, and an actionable next step.

### 2. Business Growth Autopilot
Use business growth signals + engagement attribution + campaign/promotion analytics + search boosts + custom notifications + scheduled reports to generate prioritized growth opportunities.

**Outcome:** signal → recommended action → accepted/completed state → measured result → report.

### 3. Fleet Operations Copilot
Combine custom metrics, vehicle daily metrics, driver scorecards, maintenance, routes, service opportunities, alerts and notifications.

**Outcome:** metric deviation → alert → recommended operational action → completion → KPI change.

### 4. Data Intelligence / Dataset Observatory
Expose public-data discovery, provenance, import jobs, freshness, confidence, conflicts, and coverage gaps to Admin and appropriate enterprise/business users.

**Outcome:** dataset → ingestion → observations → conflict/quality evaluation → location intelligence → audit/report.

### 5. Geofence Automation
Turn existing geofence infrastructure into configurable business triggers for nearby notifications, QR offers, preferred-location activation, quests and conversion tracking.

**Outcome:** enter/dwell/exit → eligible audience → persisted notification/offer → conversion → analytics.

### 6. QR Engagement Automation
Promote the existing QR action model from static QR codes to reusable programs with reward, promotion, review, event, contest, navigation and support outcomes.

**Outcome:** scan → program → authoritative action → reward/engagement → attribution.

### 7. Trust & Evidence Intelligence
Expose confidence, source provenance, community reputation and conflicts to users and operators without exposing internal complexity unnecessarily.

**Outcome:** evidence → confidence → visible trust state → correction/verification loop.

### 8. Live Network Pulse
Use `live_network_events` and realtime subscriptions to show meaningful nearby activity rather than generic realtime UI.

**Outcome:** event → audience filtering → live surface → durable analytics where appropriate.

### 9. Cross-tier Intelligence / Leaderboards
Use the network leaderboard registry for business, fleet, enterprise, contributor and location metrics, with rewards where configured.

**Outcome:** measured participation → rank → recognition/reward → reportable metric.

### 10. Social Outcome Sharing
The database already has route-shared event types and social posts/activity. The product should turn completed routes, reviews, milestones, badges, contests, business wins and verified discoveries into shareable cards/deep links.

**Outcome:** completed state → generated share artifact → social activity/analytics → return/deep-link into Kleenest.

## Priority reconciliation

| Priority | Slice | Reason |
|---|---|---|
| P0 | Intelligence Core convergence | Existing intelligence/action/notification infrastructure is the central multiplier. |
| P0 | Data Intelligence | External datasets and 12k+ data feature events are already valuable raw material. |
| P0 | Reporting convergence | Already operational; make all newly exposed intelligence measurable in reports. |
| P1 | Geofence + QR automation | Strong reusable trigger infrastructure already exists. |
| P1 | Business Growth Autopilot | Converts analytics into action and recurring value for paying business tiers. |
| P1 | Fleet Operations Copilot | Converts fleet data into operational recommendations and notifications. |
| P1 | Trust/Evidence Intelligence | Improves core consumer product quality and defensibility. |
| P2 | Offline/realtime convergence | Required to make the architecture resilient across completed verticals. |
| P2 | Social outcome sharing | High product/viral value once underlying outcomes are canonical. |
| P2 | Cross-tier leaderboards | Strong engagement layer once metrics are normalized. |

## Implementation rule
Do not expose these candidates as isolated screens. Each selected slice must be implemented front-to-back:

`canonical entry → service → authorization/entitlement → authoritative RPC/state transition → telemetry → notification/intelligence side effects → realtime/offline propagation → reporting/history/audit → polished UX`

A capability moves from ORANGE/YELLOW to GREEN only after the complete path is verified in the canonical runtime and production backend.
