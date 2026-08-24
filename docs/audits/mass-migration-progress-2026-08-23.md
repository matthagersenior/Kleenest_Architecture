# Mass migration ledger — 2026-08-23

## Acceptance criteria

Every migrated capability must reconcile all of these layers before being marked complete:

- donor implementation / proven commit
- Architecture canonical domain/service
- Supabase capability or RPC/Edge Function
- route and workspace entitlement
- visible UI control or button
- runtime mutation/read path
- deployment source of truth

## Map contract

The canonical map runtime is expected to execute:

GPS → Supabase nearby cache → direct canonical locations fallback → discovery/OSM ingestion → persisted canonical locations → re-query → map markers.

Map controls must be functional, not decorative:

- Use my location
- Search
- category
- radius
- verified-only
- favorites
- amenity filters
- marker details
- favorite
- route
- verify/evidence

## Owner control contract

The platform owner surface must expose first-class controls for routine administration without requiring JSON:

- people / users
- administrator access
- businesses
- locations
- promotions
- campaigns
- contests
- fleet
- enterprise
- operational resources

The schema-driven CRUD workbench remains the advanced/general fallback.

## Migration rule

Do not copy donor architecture wholesale when Architecture already has a canonical implementation. Extract missing behavior and wire it to the canonical service. Mark already-covered donor commits as absorbed. Preserve Supabase/RLS authority and avoid parallel service graphs.

## Current priority

1. Verify deployed map discovery against a cold geographic area (including Michigan).
2. Ensure the production `ingest-map-candidates` implementation is represented in Architecture source/deployment provenance.
3. Verify Owner CRUD is reachable from the platform owner dashboard.
4. Continue donor commit clusters in bulk, skipping behavior already absorbed.
