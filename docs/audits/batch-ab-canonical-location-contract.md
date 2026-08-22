# Batch AB — Canonical Location Contract audit

Date: 2026-08-22

## Confirmed retrieval authority

Production `prepare_universal_location_discovery(p_lat,p_lng,p_radius_m,p_user_id)` is the current shared discovery RPC. It validates coordinates, clamps radius to 1–50 km, records a `user_location_sessions` row, queries active `locations`, computes distance, returns up to 1,000 locations, and marks `needs_external_discovery` only when the local result set is empty.

Its returned location payload currently includes identity/address/geospatial fields, source/provenance fields, `verification_status`, `bathroom_verification_status`, `accessible`, `changing_table`, cleanliness, rating, review count, and timestamps. It does not currently return `verification_confidence`, `verification_observation_count`, the bathroom positive/negative counts, or the richer `kleenest_location_confidence()` projection.

## Client normalization

`universalDiscovery.js` calls the RPC and passes each result through `normalizePlace()`. It then sets `is_verified` using `bathroom_verification_status === 'verified' || verification_status === 'verified'`. `normalizePlace()` copies that boolean into both `verified` and `is_verified`, while also supporting bathroom counts and a larger intelligence field set when those fields are supplied by other retrieval paths.

## Interoperability gap

The canonical discovery RPC and the frontend place contract are not currently isomorphic. The frontend contract supports bathroom positive/negative counts, intelligence score, community agreement, weighted agreement, conflict, freshness, and last-observed metadata, but this discovery RPC does not return those fields.

Different retrieval paths can therefore produce materially different Place objects even though they represent the same `locations` entity.

## Verification semantic issue

The discovery service's `is_verified` rule conflates two backend states (`bathroom_verification_status` and `verification_status`). Map also has its own verified interpretation. Architecture should expose raw canonical fields and centralize any display-only `isVerified` policy.

## Recommended canonical contract

Architecture should model four layers:

### Identity

`id`, `name`, category/place type, address, city/state/postal, latitude/longitude, source/provenance, external IDs.

### Canonical verification

`bathroomVerificationStatus`, `bathroomVerificationSource`, `bathroomVerifiedAt`, `bathroomVerifiedBy`, `locationVerificationStatus`, `verificationObservationCount`, `verificationPositiveCount`, `verificationNegativeCount`, `verificationObservationConfidence`.

### Evidence projections

`bathroomVerificationCount`, `bathroomPositiveCount`, `bathroomNegativeCount`, cleanliness fields, reviews, amenity/fixture projections, and last-observation/freshness metadata.

### Intelligence projection

`locationConfidenceScore`, `locationConfidenceLevel`, `intelligenceScore`, freshness/conflict/agreement fields when the canonical intelligence retrieval path supplies them.

## Wiring rule

Map, Place, Business, Fleet, Route, Social, and Intelligence should consume the normalized LocationContract rather than independently selecting verification fields or inventing thresholds.

Discovery remains responsible for retrieval/population; normalization remains responsible for presentation shape; Supabase remains responsible for authoritative state and projections.

## Do not change yet

Do not expand `prepare_universal_location_discovery()` or alter frontend normalization in this audit batch. First compare all existing location retrieval RPCs/views (`nearby_locations_enriched`, map-specific discovery, business discovery, intelligence retrieval) so the new contract is based on the union of real capabilities and does not discard fields supplied by another canonical path.

No Production mutation was performed.
