# Discovery Ownership Convergence — 2026-08-29

## Decision

Map discovery is owned by `services.maps.nearby()` and the canonical maps domain. `domains/discovery/universal.js` remains a compatibility/discovery-ingestion layer and must not be instantiated directly by the Map surface.

## Why

The universal discovery service performs bounded canonical preparation, optional live candidate ingestion, canonical retry, and a bounded last-success fallback. That is useful as a compatibility path, but it is not a second Map data model.

The Map surface already calls `services.maps.nearby({ ..., discover: true })`. It therefore remains the single UI entry point for nearby map discovery.

## Regression protection

`scripts/discovery-duplication-audit.mjs` verifies that MapSurfaceV3 does not directly instantiate the universal discovery service or call its compatibility RPC. The canonical audit runner executes this gate before Fleet/Enterprise and Business convergence gates and before the production build.

## Runtime certification still required

A successful build/static audit does not establish device/browser runtime success. The remaining certification target is an authenticated map-open journey that proves: GPS → canonical map read → live discovery when needed → canonical retry → markers → details/evidence/route actions, with failure preserving prior successful results.
