# Batch N — ingestion / evidence-quality / route-discovery / entitlement reconciliation

Date: 2026-08-22

## Result

The remaining capability clusters are also largely present in Supabase. The architecture should wire existing boundaries rather than recreate them.

## External data ingestion

There is a real external-source pipeline:

`external_data_sources` -> `external_location_records` -> `external_observations` -> canonical `locations`

`ingest_external_locations()` validates configured source keys, imports/upserts external location records, preserves raw source payload, and emits `data_feature_events` with provenance/confidence.

`ingest_osm_locations()` is a specialized OSM adapter with stricter source-ID validation, external observations, amenity application, and feature events.

`location_ingestion_jobs` supplies the asynchronous job/status envelope.

### Classification

**Canonical ingestion infrastructure exists.** The app should expose source/job state and invoke canonical ingestion boundaries; it should not write external records directly.

## Evidence / quality

There are two complementary layers:

- `location_quality_observations`: user observations with cleanliness, accessibility, safety, availability, condition, stars, feedback, check-in/photo linkage, and metadata.
- `location_quality_reviews`: moderation/normalization/review workflow with canonical-location linkage and explicit evidence JSON.

`submit_location_quality_observation()` is server-authoritative and records a progression metric event plus a `data_feature_events` record containing validity, confidence, provenance context, and deduplication metadata.

External observations independently carry `confidence`, `verification_state`, `provenance`, and timestamps.

### Classification

**Evidence/quality is a real shared domain primitive.** It should sit beneath Maps/location presentation and above raw source ingestion. Do not collapse external evidence and user observations into one undifferentiated source field.

Recommended conceptual hierarchy:

`raw external source`
-> `external record / observation`
-> `canonical location`
-> `user quality observation`
-> `moderation / quality review`
-> `derived quality signals`

## Route discovery

Route discovery is already a dedicated subsystem:

- `route_plans` own route geometry and planning state.
- `route_discovery_sessions` own user/route-specific discovery lifecycle and expiration.
- `route_discovery_cells` provide source/cell refresh state.
- `route_discovery_locations` hold discovered canonical locations, trigger radius, source, discovery time, and geofence state.

`prepare_route_discovery()` creates an authenticated user's session and automatically populates the cache when route geometry exists.

`populate_route_discovery_cache()` resolves active canonical locations from the route corridor using PostGIS and records them in the session cache.

### Classification

**Route discovery is a canonical Maps/Route subsystem, not a Fleet subsystem.** Fleet routes may consume route geometry and stops, but should not own generic location discovery.

This resolves the ownership question: generic route discovery belongs to the route/maps layer; Fleet owns fleet operational routes and their lifecycle.

## Entitlement resolution

`get_current_user_product_entitlements()` provides a server-side account entitlement boundary exposing service tier, location limit, Fleet enablement, and Enterprise Fleet enablement.

`sync_business_service_entitlement()` maps business tier to account service entitlement records, while `has_fleet_access()` is used by Fleet RPCs as the domain-level access gate.

`feature_catalog` separately describes feature-level availability and minimum tiers.

### Classification

There are **three distinct concepts that must remain separate**:

1. account/service entitlement,
2. business/domain authorization,
3. feature catalog availability.

Do not replace these with one client-side tier flag.

The architecture should resolve access in this order:

`authenticated user`
-> `account/service entitlement`
-> `business membership/domain authorization`
-> `feature catalog capability`
-> `domain operation`

## Telemetry hierarchy

Fleet has both:

- `fleet_operational_events`: business/vehicle/driver/route event facts with numeric value/unit and geospatial/time metadata.
- `fleet_performance_events`: driver/vehicle/route performance events with a metrics JSON payload and optional network-event linkage.

Downstream Fleet projections include vehicle daily metrics, driver scorecards, and business metric snapshots.

### Classification

This is already a layered telemetry architecture rather than a single metrics table:

`operational/performance events`
-> `derived daily/driver/business measurements`
-> `scorecards / dashboard projections`
-> `shared progression/leaderboard consumers`

The missing piece remains only controller-authored configuration over those measurements.

## Architecture impact

The major ownership map is now stable:

| Capability | Canonical owner | Existing backend state | Client should do |
|---|---|---|---|
| External ingestion | Data/Maps ingestion | sources, records, observations, jobs, ingest RPCs | invoke/status/display |
| Evidence & quality | Quality/Maps | observations, reviews, provenance/confidence | submit/review/display |
| Generic route discovery | Maps/Route | plans, sessions, cells, discovered locations | orchestrate UI |
| Fleet route lifecycle | Fleet | fleet routes/updates/status RPCs | invoke/display |
| Account entitlements | Account/Entitlements | service entitlement RPC | resolve access |
| Business authorization | Business/Fleet | memberships + domain gates | never trust UI flags |
| Feature availability | Feature registry | feature_catalog | resolve capability |
| Fleet telemetry | Fleet measurement | operational/performance events | consume |
| Fleet scorecards | Fleet analytics | driver/business projections | consume |
| Controller metric configuration | Fleet business config | **missing** | **future thin adapter** |

## Important non-findings

We did **not** find evidence that any of these missing capabilities require a new generalized backend engine:

- external ingestion engine — exists;
- evidence/provenance model — exists;
- quality workflow — exists;
- route discovery cache — exists;
- entitlement resolution — exists;
- telemetry fact hierarchy — exists.

The only consistently genuine architecture gap discovered so far remains **Fleet controller-authored metric configuration**.

## Security / implementation notes

The previously identified `get_partner_network_benchmark()` authorization defect remains outstanding. No Production mutation was made during this batch.

`SECURITY DEFINER` functions must remain behind their server-side authorization predicates; client-side entitlement checks are not substitutes.

## Gate

The hidden-capability reconciliation is now sufficiently complete to move toward the **full architecture audit**. The next step is not to start wiring individual screens. First reconcile the canonical contracts, ownership, dependency graph, and shell mounting boundaries into one architecture map. Then implement only the genuinely missing adapter(s), followed by wiring.

No Production mutations were performed in this batch.
