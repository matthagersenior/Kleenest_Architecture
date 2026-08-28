# Kleenest — Evidence / Progression Authority Repair — 2026-08-28

## Scope
Continuation of the location-evidence authority repair across restroom, amenity, and location-quality observations.

## Findings and repairs

### Restroom observations
The canonical `submit_restroom_observation` contract now binds optional check-ins to the authenticated user and canonical location, rejects invalid verification methods/timestamps and departed visits, records provenance/confidence, and emits a server-authoritative feature event. Progression is gated to a qualifying visit and uses deterministic idempotency scoped to user/location/check-in/evidence type.

### Amenity observations
`submit_amenity_observation` previously awarded a progression metric for every submitted observation, even without a qualifying visit. It now preserves the evidence record but awards progression only for a qualifying check-in and supplies a deterministic idempotency key scoped to user/location/amenity/check-in.

The existing amenity confirmation and feature-event triggers remain intact; no second evidence system was introduced.

### Location-quality observations
`submit_location_quality_observation` previously recorded a reward-capable progression metric for every observation. It now validates the canonical location and optional check-in ownership, records the existing server-authoritative feature event, and only invokes progression for a qualifying visit with deterministic idempotency metadata.

## Production verification

Production Supabase was inspected before and after the repair. Current contribution tables are empty, so there is no existing production evidence history to migrate or backfill. Existing `progression_metric_events` for these evidence metrics are also empty.

The live `record_progression_metric_event` contract was verified to be reward-capable, and its idempotency behavior was verified against the new evidence keys.

## Remaining authority risk

The next highest-priority location-evidence issue is the overlapping bathroom-state writers identified in Batch Y: trusted bathroom verification, community location verification, location verification submission, restroom observation, and external amenity ingestion can all project into overlapping `locations` bathroom fields. The next repair should build the field-level writer matrix and consolidate projection authority without collapsing distinct evidence provenance.

## Commits

- `3302af744b13420f4071c31ac67d9b04a7f360b9` — restroom observation progression guard.
- `f9e26485a73ba22c52ea2c74e44d421480246b6a` — amenity/quality observation progression hardening.

## Acceptance

Evidence remains independently useful for intelligence and provenance. Rewards are no longer granted merely because a client can submit an observation repeatedly; progression is server-gated and idempotent.
