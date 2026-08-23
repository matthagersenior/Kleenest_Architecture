# Batch AR — Map GPS discovery + owner demo business reconciliation

## Completed

- Map radius remains user-selected; no fallback silently changes the radius to 100 km.
- GPS is the map query origin.
- `services.maps` now uses the authenticated `prepare_universal_location_discovery` contract before external discovery when the user is signed in.
- Map discovery errors are preserved in the UI status instead of being overwritten by a generic zero-result message.
- `ingest-map-candidates` was upgraded from a single-shot Overpass strategy to multi-endpoint retries plus bounding-box subdivision.
- Production validation at the Sparta-area GPS coordinates used during the map investigation initially returned zero locations inside 8 km; after the discovery repair, the same 8 km query returned 25 canonical locations, with the nearest at approximately 147 m.
- The production discovery invocation imported 25 locations, updated 1 existing location, and upserted 210 observations.
- Owner demo businesses are now exposed consistently to Business Asset Lifecycle, Engagement, Analytics, and Intelligence pages through `listBusinesses({ includeDemo: isPlatformOwner })`.
- Map visual styling was upgraded with stronger surfaces, status treatment, result cards, chips, responsive composition, and clearer map legends.

## Root cause found

The prior map fallback was correctly preserving the selected radius, but the external discovery function itself was failing because both of its original Overpass sources were unavailable. The client then replaced the useful discovery error with a generic "no locations" state. The database consequently had no newly discovered locations in the affected GPS cell.

## Canonical path

`GPS -> services.maps.nearby -> authenticated universal discovery -> ingest-map-candidates -> ingest_osm_locations -> locations -> map_network_nearby_v1 -> MapSurface`

The selected radius remains authoritative throughout this chain.
