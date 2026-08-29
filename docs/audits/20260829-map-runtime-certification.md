# Map Runtime Certification — 2026-08-29

## Production data check

The connected production Supabase database contains substantial canonical location data. A direct production query found 1,070 active restroom-qualified records and 2,717 active locations within an approximately 50-mile bounding approximation around the St. Louis map center.

These counts establish that an empty map cannot be explained by an empty canonical location store.

## Map execution path

`MapSurfaceV3` calls the canonical `services.maps.nearby()` service. The map service first reads `map_network_nearby_v1`, then, when empty, invokes bounded live discovery through `ingest-map-candidates-v3`, retries the canonical RPC, and finally attempts `prepare_universal_location_discovery` as a compatibility path.

Live discovery records discovery telemetry and authenticated ingestion writes through `ingest_external_locations`. The ingestion edge function returns live candidates even when persistence is unavailable, preventing an ingestion write failure from being confused with a discovery failure.

## Failure-state rule

MapSurfaceV3 does not substitute demo accounts or fabricated locations. A failed/empty search either shows the last successful result set for the same search context or explicitly reports no locations/error.

## Certification limitation

The production SQL checks were performed with database authority and therefore establish data presence, not the exact authenticated browser/RLS response. Final UI certification still requires exercising the deployed application with a real authenticated session and confirming the rendered marker count.
