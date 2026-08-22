# Kleenest Architecture

## Authority
- `Kleenest_Architecture` is the canonical application architecture and deployment/test surface.
- `Kleenest_App` is the migration source until each capability is migrated and verified; it is not a competing runtime.
- Legacy `Kleenest`, `KleenestApp`, and refactor branches are reference-only.

## Runtime ownership
`main.jsx` → `CanonicalAppRuntime` → canonical page/workspace → domain services → single Supabase boundary.

Maps remain owned by `CanonicalAppRuntime → MapWorkspace/MapSurface`. No second map, shell, router, or runtime is permitted.

## Feature parity rule
Supabase production capabilities are the backend master checklist. Every capability moves through:
1. capability contract
2. canonical service
3. canonical UI surface
4. real action/button termination
5. auth/entitlement/identity enforcement
6. offline/retry behavior where applicable
7. CI/build verification

A capability is not marked complete because an RPC exists or a page exists; the complete path must work end-to-end.

## Packaging rule
Organize by domain and shared infrastructure. One implementation per capability. Shared primitives are imported; they are never copied into alternate pages/services.

## Deployment rule
The architecture repository must produce the Pages test build directly. Environment values are injected at build/deploy time; secrets are never committed.

## Migration rule
Existing working code is migrated into canonical ownership rather than rewritten into parallel versions. After a capability is migrated and verified, duplicate implementations are removed or explicitly quarantined as reference-only.
