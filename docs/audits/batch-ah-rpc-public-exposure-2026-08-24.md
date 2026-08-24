# Batch AH — RPC public exposure

- Removed public execution from authenticated-only message state mutation.
- Removed public execution from cross-tier leaderboard access to prevent unauthenticated actor-level enumeration.
- Reviewed remaining anonymous SECURITY DEFINER RPCs individually against their function bodies; public catalog, home discovery, QR-program lookup, map-nearby, restroom-nearby, and public-data search remain intentional read surfaces.
- Re-verified the affected execution grants after migration.
