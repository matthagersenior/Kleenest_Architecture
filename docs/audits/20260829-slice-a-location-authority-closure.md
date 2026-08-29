# Slice A — Location Authority Closure — 2026-08-29

## Implementation status

The first location-authority closure pass is now wired on `main`.

### Front-end convergence

`src/domains/locations/details.js` now treats `get_location_authority_bundle(p_location_id)` as the single authoritative online read contract for:

- location/place identity;
- intelligence snapshot;
- trust state;
- reviews, profiles, reputation and review photos;
- external records and source payload/tag availability;
- favorite/check-in interaction state.

The service now has one `fetchAuthorityBundle()` path. `trustState()` no longer makes a separate trust RPC, and `interactionState()` no longer creates a second read authority. Offline remains a fallback only.

### Live backend verification

`get_location_authority_bundle(uuid)` is authenticated-only (`anon_execute=false`, `authenticated_execute=true`). A live smoke test against an active canonical location returned location, place, intelligence, trust, review and external-record sections with `schema_version=1`.

### Identity/provenance behavior

The normalized read object preserves canonical location identity while projecting source, dataset, external IDs, raw source payload, raw tags/OSM tags, and source provenance. This keeps OSM/Overpass evidence available instead of flattening it into lossy location fields.

### Interoperability smoke verification

- Canonical map discovery returned 50 rows for the audit origin, all 50 with canonical `location_id` and valid coordinates.
- Map → detail identity continuity passed: the first map result's `location_id` exactly matched the `get_location_authority_bundle` location ID.
- Route stop → detail identity continuity passed for an existing route stop; the route stop `location_id` exactly matched the authority bundle location ID.
- The canonical authority bundle exposed place and trust data for both tested detail paths.

## Remaining Slice A work

The current runtime details path and live map/route identity checks are closed, but the complete slice acceptance gate still requires:

1. offline/online snapshot normalization equivalence verification;
2. telemetry verification for authoritative read/fallback/error states;
3. CI guard for new protected-table direct access.

These are the next implementation checks before declaring Slice A fully closed.

## Relationship to Slice 0

Slice 0 governance/authority repair was completed in parallel: all capability-function rows are classified, unexplained anonymous SECURITY DEFINER execution is zero, and the maps ingestion persistence authorization defect is repaired in Production and recorded in repository migrations.
