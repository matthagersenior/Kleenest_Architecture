# Slice A — Location Authority Closure

Status: **Implemented in repository; pending CI + production migration verification**

## Objective

Close the location authority boundary so map, search, details, routes, business, fleet, and enterprise surfaces consume one normalized location contract while preserving complete external-source evidence.

## Front-to-back wiring

`OSM/Overpass + other external sources → external_location_records → canonical locations → get_location_authority_bundle → location details service → consuming surfaces`

The bundle also carries:

- canonical location/place identity;
- complete canonical address fields;
- source/source_dataset;
- external record payloads;
- raw external payload and raw OSM tags when present;
- intelligence snapshot;
- trust state;
- review + profile + reputation + photo data;
- favorite/check-in interaction state.

## Changes

### Database

`supabase/migrations/20260829100000_location_authority_bundle.sql`

Adds the authenticated `get_location_authority_bundle(uuid)` RPC as the single composite read contract. The function is `SECURITY DEFINER`, pins `search_path`, is executable only by `authenticated`, and returns a JSONB envelope with schema versioning.

### Application

`src/domains/locations/details.js`

The online location-details path now calls the authority bundle instead of directly reading `places`, `locations`, `location_intelligence_snapshot`, `reviews`, `contributor_reputation`, `review_photos`, `favorites`, or `check_ins`.

Offline cache remains a fallback rather than a competing online authority.

The normalizer preserves source payloads and exposes `raw_tags` / `osm_tags` so source information is not lost while the canonical model is consumed.

## Compatibility

The RPC accepts either a canonical location ID or an active `places.id`, resolving the latter to its canonical location. This protects existing callers while moving the read path to canonical location authority.

## Exit criteria

- [x] canonical service boundary for location details;
- [x] address remains part of canonical location data;
- [x] external payload/provenance is retained;
- [x] raw OSM tags are surfaced when present;
- [x] trust/intelligence/review context is returned with the same location ID;
- [x] interaction state uses the same authoritative read;
- [x] offline remains a fallback;
- [ ] map → detail → route → verification production smoke test;
- [ ] CI regression guard passes;
- [ ] live migration applies successfully.

## Follow-on wiring in this slice

The next implementation pass should migrate map/search/business/fleet/enterprise consumers to the same authority bundle or a projection derived from it, then add a CI guard that rejects new direct protected-table reads in runtime services.

## Baseline guardrail

Do not regress the current working map, route, Business Enterprise preview, platform-owner authorization, QR Studio, styling, OSM ingestion, address enrichment, or route destination/waypoint semantics while closing this authority boundary.
