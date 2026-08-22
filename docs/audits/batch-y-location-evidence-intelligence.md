# Batch Y — Location / evidence / intelligence authority audit

Date: 2026-08-22

## Confirmed authority layers

Production currently contains several distinct evidence systems. They should not be collapsed merely because they all describe a location.

### 1. Location quality observations

`submit_location_quality_observation` writes `location_quality_observations`, records a progression metric (`review` / `location_quality_observation`, 20 points when enabled), and writes a server-authoritative `data_feature_events` record with a deterministic event key.

This is both an evidence record and a Business Intelligence event source.

### 2. Amenity observations

`submit_amenity_observation` writes `location_amenity_observations`, then invokes `record_progression_metric_event('verification','amenity_observation',...,15,...)`.

The insert trigger also invokes `apply_user_amenity_confirmation`, which can update `location_amenities` and selected denormalized location fields and emits an `amenity_confirmed` feature event.

**Important:** this creates another confirmed progression overlap candidate. The Architecture audit must compare the explicit 15-point progression metric with any `gamification_activity_trigger` attached to `location_amenity_observations` and determine whether the metric is an independent progression definition or duplicates trigger-owned rewards.

### 3. Bathroom/restroom observations

`submit_restroom_observation` writes the observation, updates bathroom verification counters/status, detects contradictory observations, and writes a server-authoritative `restroom_observation` feature event.

It is therefore a canonical evidence pipeline, not just a UI form submission.

### 4. Trusted bathroom verification

`record_bathroom_verification` is a restricted trusted-verification command with GPS/geofence and eligibility checks. It writes the verification record and maintains location verification state; the trigger's current implementation explicitly states that gamification is the reward authority.

However, the function itself also inserts `location_verification_points` and updates `profiles.points` for a positive trusted verification. This is a **potential authority conflict** that must be resolved before consolidation: the trigger says gamification is the single authority for reward points, while this RPC directly increments profile points.

### 5. Community location verification

`record_location_verification` independently writes `location_bathroom_verifications` and directly updates bathroom counters/status. `submit_location_verification` is another path that writes `restroom_observations`, `location_bathroom_verifications`, and directly updates the same bathroom fields.

These are not interchangeable APIs. They have different validation and semantics, but they write overlapping location state.

### 6. Location confidence

`kleenest_location_confidence` is a derived scoring function. It combines verification state, bathroom evidence, reviews, sources, freshness, and contradictory amenity observations. It explicitly exposes conflicts rather than silently collapsing them.

Therefore confidence is a **projection**, not a primary field that clients should independently maintain.

## Major architecture risks

### A. Multiple bathroom writers

At least six production paths can modify `locations.bathroom_*` state:

- `process_bathroom_verification`
- `record_bathroom_verification`
- `record_location_verification`
- `submit_location_verification`
- `submit_restroom_observation`
- external amenity ingestion

This is the highest-priority location-authority consolidation target.

### B. Reward authority conflict

The current trusted verification RPC directly awards points while the trigger documentation says gamification is the single reward authority. Do not wire both as independent capabilities until the actual call path and intended idempotency are reconciled.

### C. Observation → event → intelligence

Quality, amenity, and restroom observations create feature events. Those events feed downstream analytics/intelligence. Removing or duplicating them changes more than UI analytics.

### D. External vs user evidence

External observations can update canonical amenities and bathroom sourcing, while user observations create evidence and confirmations. They are different provenance classes and should remain distinguishable in Architecture.

## Architecture decisions

1. Keep evidence tables distinct by evidence/provenance type.
2. Treat `locations` verification fields as projections maintained by authoritative server commands/triggers.
3. Treat `kleenest_location_confidence` as a derived read model.
4. Never let a client calculate and write confidence as canonical truth.
5. Resolve the trusted-verification reward conflict before wiring that feature.
6. Build an explicit bathroom-state authority matrix before refactoring any bathroom verification path.
7. Preserve server-authoritative feature events because Intelligence/BI consumes them.

## Next reconciliation target

Build a field-level matrix for `locations` fields:

- `bathroom_verification_status`
- `bathroom_verification_source`
- `bathroom_verified_at`
- `bathroom_verified_by`
- `bathroom_verification_count`
- `bathroom_positive_count`
- `bathroom_negative_count`
- `verification_status`
- `verification_observation_count`
- `verification_positive_count`
- `verification_negative_count`
- `verification_confidence`
- `accessible`
- `changing_table`

For each field, identify every writer, trigger, RPC, client caller, and derived reader before modifying schema or frontend wiring.

No Production mutation was performed.
