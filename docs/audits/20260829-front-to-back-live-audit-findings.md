# Kleenest — Live Front-to-Back Audit Findings — 2026-08-29

## Scope

This is the first execution pass of the front-to-back interoperability program. It compares the current repository against live Supabase authority and the organizational capability catalog while preserving the current working baseline.

## Confirmed architectural finding: location details still bypass the canonical service boundary

`src/domains/locations/details.js` directly queries `places`, `locations`, `location_intelligence_snapshot`, `reviews`, `contributor_reputation`, `review_photos`, `favorites`, and `check_ins` with `client.from(...)`.

This is a high-priority **Partial / Duplicate-authority risk** because the database already exposes canonical location/trust RPCs such as `get_location_details`, `get_location_trust_state`, `get_location_trust_summary`, `get_location_bathroom_verification`, and related evidence functions.

### Required change

Converge the location details service on a single authoritative read contract that returns:

- canonical location identity;
- address and complete external-source provenance;
- OSM/Overpass tags/source payload references;
- amenities and amenity confidence;
- trust state;
- freshness/staleness;
- intelligence snapshot;
- review summary and authorized review details;
- interaction state through authorized action contracts.

Keep offline cache as a read fallback, not as a second authority.

## Confirmed architectural finding: direct protected-table access is rare but strategically important

Repository search found a small number of direct Supabase table access paths in application/runtime code, including Social, location details, access offers, and legacy QR Studio variants. This is useful: the surface area is small enough to eliminate systematically rather than tolerate indefinitely.

### Required change

Classify each direct access as:

- canonical service-required;
- explicitly public-safe read;
- offline/local-only;
- migration/ingestion code;
- legacy path to retire.

No new runtime direct protected-table access should be introduced.

## Confirmed live Supabase security findings

The live security advisor currently reports:

- `public.place_experience_projection` is a SECURITY DEFINER view.
- `public.stripe_webhook_events` has RLS enabled but no policies.
- several anon-callable SECURITY DEFINER functions exist, including `get_public_qr_landing`, `map_network_nearby_v1`, and `sync_external_location_address`.
- many authenticated-callable SECURITY DEFINER functions span business, fleet, enterprise, location, route, evidence, progression, notification, and admin domains.
- `is_platform_owner_session()` is authenticated-callable and must remain executable while preserving its owner check.
- leaked password protection is disabled.

These findings are tracked separately in GitHub issue #16. They are **not** to be fixed with blanket revokes; each function needs an explicit exposure class and body-level authorization review.

## High-value hidden capability clusters identified

### Location intelligence

The live substrate supports complete external evidence, address backfill, confidence/freshness, amenity observations, reverification targets, and trust summaries. The product should expose this as a coherent location intelligence layer rather than separate fragments.

### Business engagement

The live substrate contains QR creation/update/status/customization, public QR landing, attribution, engagement programs, QR analytics, geofence configuration, campaign/promotion/event creation and analytics, partner programs, and ROI/funnel functions. The next opportunity is to connect these into a single measurable engagement lifecycle.

### Fleet intelligence

The live substrate includes fleet metric definitions/configuration/values, route/vehicle/driver/maintenance operations, leaderboards, alerts, service opportunities, and dashboard summaries. The next opportunity is to make metrics operational: signal → recommendation → action → outcome.

### Enterprise network intelligence

Enterprise partner networks, campaigns, allocations, member lists, partner analytics, benchmarks, and ROI functions exist. The next opportunity is shared intelligence across Business/Fleet/Enterprise without duplicated metrics engines.

### Progression / quests

Quest creation, availability, start, step recording, event dispatch, game challenges, and progression actions exist. The next opportunity is tighter interoperability with route, QR, geofence, check-in, evidence, and community events.

### Public-data discovery

Public data catalog search and multiple ingestion Edge Functions exist. The next opportunity is exposing source/provenance intelligence without collapsing source payloads into lossy canonical fields.

## Initial domain status

| Domain | Status | Primary next action |
|---|---|---|
| Location identity | Partial | canonical details/read contract |
| External OSM/Data.gov | Partial/Wired substrate | preserve/expose provenance + tags |
| Address | Wired substrate | integrate into every location read surface |
| Amenities | Partial | authoritative amenity read/write + confidence |
| Trust/evidence | Partial/Wired foundation | prove propagation |
| Routing | Partial/Wired foundation | prove destination/stop/event convergence |
| Progression | Partial | consume canonical evidence/route/QR/geofence events |
| Community | Partial | remove direct reads and connect reputation/evidence |
| Business | Partial/Wired foundation | unified operator loop |
| QR | Partial/Wired foundation | comprehensive Studio + scan lifecycle |
| Geofence | Partial | connect events to engagement/intelligence |
| Fleet | Partial | operationalize metrics/actions/outcomes |
| Enterprise | Partial | shared network intelligence |
| Intelligence | Partial/Wired substrate | universal action/outcome lifecycle |
| Notifications | Partial | delivery/realtime verification |
| Offline | Partial | authoritative replay/reconciliation |
| Billing/entitlements | Partial | align gates with backend authority |
| Admin/Owner | Partial | capability graph + diagnostics |
| Governance | Partial | moderation lifecycle |
| AI | Hidden/Planned | retrieval/explanation augmentation only |

## First large-slice recommendation

**Slice A — Location Authority Closure** is confirmed as the correct next implementation batch.

### Batch scope

1. Replace direct location-details reads with the canonical authoritative contract.
2. Reconcile place/location identity normalization.
3. Add a single location read model for map/search/details/business/fleet/enterprise consumers.
4. Include address, source, dataset, external IDs, raw-tag availability, confidence, freshness, amenities, trust, and intelligence.
5. Make offline snapshots conform to the same normalized contract.
6. Update all dependent surfaces to consume the same object shape.
7. Add regression tests for map → detail → route → verification continuity.
8. Add telemetry for location-read source/fallback/error states.

### Exit criteria

- no duplicate location authority in the consumer read path;
- no loss of OSM/Overpass tags or provenance;
- address fields are consistently available;
- amenity/trust/intelligence data share the same canonical location ID;
- map selection and details preserve identity;
- route destination/waypoint IDs remain stable;
- offline and online normalization produce equivalent location identity;
- CI detects new direct protected-table access.

## Second large-slice recommendation

**Slice B — Trust Loop Closure** should follow immediately after Slice A.

`location → arrival → check-in → observation → evidence → review → reputation → progression/community → intelligence`

The first audit should measure propagation rather than simply count functions or tables.

## Third large-slice recommendation

**Slice C — Route + Evidence Convergence** should then unify route lifecycle, stop ordering, destination semantics, arrival evidence, route completion, offline recovery, and fleet dispatch locking.

## Guardrail

The 2026-08-29 application state is the protected baseline. Large slices must improve interoperability without regressing current map, route, Business Enterprise preview, owner authorization, QR Studio, styling, or OSM/address behavior.
