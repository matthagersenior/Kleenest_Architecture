# Migration batch status

The Architecture repository is being migrated in large autonomous batches from the proven Kleenest application and Production Supabase contracts.

## Acceptance chain

1. Production capability exists.
2. Canonical Architecture service exists or is consolidated.
3. Product surface exists.
4. Canonical runtime route reaches it.
5. Workspace/Home navigation exposes it.
6. Actions invoke the real mutation/query contract.
7. Vite build succeeds.
8. GitHub Pages deploys the built React application.

The capabilities explorer is reference tooling only; the root application must remain the actual React product.

## Current migration position

- **Batch 8 — Maps / location discovery:** migrated. The canonical MapSurface remains the target and uses `AppContext → services.maps → map_network_nearby_v1/search_locations`; no donor `mapNetwork.js` copy was introduced.
- **Batch 9 — Connected location interaction chain:** migrated into the canonical runtime boundary. Map-selected locations can now resolve through the canonical location-details service and `/place/:id` surface; Place Detail actions hand off to Visit/check-in, verified review, evidence, Activity, Progression, QR/geofence, rewards, and leaderboard capabilities already present in Architecture.
- **Batch 10 — Fleet intelligence recommendation chain:** migrated. Donor Fleet recommendation/notification primitives were adapted into `domains/fleet/recommendations.js` and `domains/fleet/notifications.js`, then wired into the canonical Fleet operations service while preserving the production `fleet_service_opportunities_for_business` RPC boundary. Fleet intelligence now exposes deterministic high-priority recommendations and deduped notification candidates without importing donor service files.

## Migration rule

Migration is implementation work, not capability-graph or test-lab work. Donor behavior is adapted into Architecture's canonical domains/services and production Supabase contracts. The architecture/interoperability matrix remains authoritative.
