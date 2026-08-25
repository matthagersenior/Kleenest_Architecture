# Maps Core Reliability Batch — 2026-08-25

## Production verification

- `public.locations`: 9,227 total; 9,227 active; 9,222 active/geocoded.
- `map_network_nearby_v1` responds successfully for the Sparta-area test coordinates.
- The canonical location network therefore exists and the geospatial RPC is operational.
- The test area had no restroom-classified records inside the tested 8 km / 30 km windows, demonstrating a local restroom coverage gap rather than a global location-table failure.
- Production `ingest-map-candidates` is active (version 17) and uses three Overpass endpoints, retries, and bounding-box subdivision.

## Runtime repair

`src/domains/maps/network.js` now treats nearby retrieval as a resilient canonical pipeline:

1. Query `map_network_nearby_v1`.
2. Fall back to a direct active/geocoded `locations` query.
3. If still empty, invoke live `ingest-map-candidates` discovery.
4. Re-query the canonical RPC after ingestion.
5. Retry the direct canonical table query.
6. Fall back to `prepare_universal_location_discovery` when persisted retrieval is still empty.
7. Surface the actual retrieval error instead of silently converting a backend failure into an empty result.

This preserves `locations` and `map_network_nearby_v1` as the canonical persisted map authority while allowing live discovery to repair geographic coverage.

## Acceptance target

Map startup must be GPS-first and must not depend on prior ingestion for the user to receive useful nearby results. Existing persisted data is preferred; live discovery supplements missing coverage. Empty results are valid only when the complete retrieval/discovery chain has actually returned no locations.
