# Map Runtime Certification — 2026-08-29

## Production data check

The connected production Supabase database contains substantial canonical location data. A direct production query found 10,552 OSM/OpenStreetMap-sourced locations with coordinates. The map cannot be explained by an empty canonical location store.

The production audit also found that OSM address coverage was incomplete: 5,641 of those 10,552 records still have no address after reconciling address fields from the stored OSM source tags. This is now an explicit data-quality/backfill track rather than a hidden UI failure.

## Remediation completed in this slice

### Canonical map discovery convergence

`services.maps.nearby()` now preserves the canonical RPC as the first path, but when bounded live discovery returns candidates it can use `data.locations` directly instead of requiring those candidates to have been persisted before the UI can render them. This matches the `ingest-map-candidates-v3` contract, which is an interactive discovery path rather than a guarantee that every candidate is immediately persisted.

### Map refresh/render resilience

The canonical `MapSurface` now uses `MapSurfaceStable` with an explicit map-ready state, resize/page-show/orientation recovery, tile error reporting, and a loading state instead of silently leaving an empty map canvas after refresh.

### Location detail continuity

Selecting a marker or result now exposes the selected location's address, category, distance, source, phone/website when available, bathroom intelligence, full-details navigation, and route handoff. The selected map icon remains visually highlighted.

### Default radius

The default discovery radius is now **2 miles**. Existing radius choices remain available for expansion.

### Legend and marker clarity

The legend now uses explicit status glyphs and bathroom-intelligence badges. Map markers are larger, have stronger status/bathroom indicators, and gain a visible selected state.

### Category selector correctness

The canonical `MAP_CATEGORIES` array is now consumed by category ID rather than `Object.entries()`, preventing numeric array indexes from being sent as category values.

### OSM address reconciliation

A production migration backfilled missing `locations.address`, city, state, postal code, phone, and website values from stored OSM source tags where those values existed. Remaining missing addresses are candidates for the existing authenticated Nominatim backfill function; no fabricated addresses are introduced.

## Execution path

`MapSurface → services.maps.nearby() → map_network_nearby_v1 → bounded ingest-map-candidates-v3 discovery → direct live-candidate rendering when persistence is not immediately available → prepare_universal_location_discovery compatibility path → selected-location UI → route/details handoff`

## Failure-state rule

Map runtime does not substitute demo accounts or fabricated locations. A failed/empty search keeps the last successful result set where the search context matches; otherwise it reports an explicit empty/error state.

## Certification limitation

Production SQL checks establish data presence and database-side behavior. Final UI certification still requires exercising the deployed application with a real authenticated session and confirming rendered map tiles, marker count, marker selection, detail continuity, and route handoff on the Pages deployment.
