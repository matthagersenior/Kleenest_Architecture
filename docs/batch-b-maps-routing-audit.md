# Batch B — Locations / Maps / Routing / Quality Audit

Date: 2026-08-22

## Verified reference consumers

- `src/services/mapNetwork.js`
- `src/pages/RoutePlannerPage.jsx`
- `src/services/routePlans.js`
- `src/services/mapNetworkParams.js`
- `src/components/MapSurface.jsx`

## Maps findings

`mapNetwork.js` is a strong reference for the canonical discovery contract. It calls Production RPC `map_network_nearby_v1` for nearby discovery and `search_locations` for non-geospatial search. Results are normalized through the existing place contract and include distance, amenities, fixtures, brand/operator, and OSM metadata.

Architecture should preserve the RPC boundary and normalization behavior while removing UI-specific assumptions. Category definitions belong to the maps/location domain, not the map component.

## Routing findings

`RoutePlannerPage` demonstrates an end-to-end route lifecycle:

1. list current user's routes
2. create route
3. read route with stops
4. add location stop
5. prepare route discovery
6. list discovered corridor candidates
7. prepare offline pack
8. start route
9. complete route

`routePlans.js` confirms Production authorities for `create_route_plan`, `prepare_route_discovery`, and `complete_route` RPCs. It also reads `route_plans`, `route_stops`, and `route_discovery_sessions`.

The reference implementation also performs direct `route_stops` insert, `route_plans` update, and `route_events` insert. Those writes are **not promoted to canonical Architecture writes yet**; they require explicit Production authorization/RLS/RPC verification.

## Offline findings

Offline is not a page-only feature. Route discovery and offline packs are coupled: the reference implementation prepares discovery and then creates a route offline pack. Production exposes `offline_packs`, `offline_pack_locations`, `offline_pack_businesses`, and `offline_pack_events`.

The Architecture contract will therefore model offline as a domain capability shared by maps and routing.

## Quality findings

Production exposes a substantial quality/verification system (`location_confidence`, observations, votes, verification campaigns/targets/observations, quality reviews, contributor reputation). The reference consumer evidence is distributed across map/reputation/quality services. This should be consolidated under `location-quality` rather than copied as independent services.

## Batch B architecture decisions

- `locations` owns canonical place/location normalization and discovery inputs.
- `maps` owns geospatial discovery/search and map-facing query contracts.
- `routing` owns route plans, stops, discovery, lifecycle, and route events.
- `offline` owns offline packs and their lifecycle.
- `location-quality` owns confidence, observations, verification, and contributor-quality signals.
- RPCs are the preferred write boundary whenever Production already provides them.
- Direct writes found in the reference app remain evidence only until their authorization boundary is verified.
- `MapSurface` is a consumer of map capabilities; it is not the owner of discovery or location data.
