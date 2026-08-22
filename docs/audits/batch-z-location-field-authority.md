# Batch Z — Location field authority matrix

Date: 2026-08-22

This batch reconciles the requested `locations` fields against the live Production function/trigger definitions. It intentionally does not modify Production.

## Field matrix

| Field | Confirmed writers / maintainers | Classification |
|---|---|---|
| `bathroom_verification_status` | `process_bathroom_verification`; `record_bathroom_verification`; `record_location_verification`; `submit_location_verification`; `submit_restroom_observation` | **Competing writers / highest-risk field** |
| `bathroom_verification_source` | Same bathroom paths above | **Competing writers; provenance-sensitive** |
| `bathroom_verified_at` | Same bathroom paths above | **Projection maintained by multiple commands** |
| `bathroom_verified_by` | `process_bathroom_verification`; `record_bathroom_verification`; `submit_location_verification` | **Competing writers** |
| `bathroom_verification_count` | `process_bathroom_verification`; `record_bathroom_verification`; `record_location_verification`; `submit_location_verification`; `submit_restroom_observation` | **Counter projection with multiple mutation paths** |
| `bathroom_positive_count` | Same five paths | **Counter projection with multiple mutation paths** |
| `bathroom_negative_count` | Same five paths | **Counter projection with multiple mutation paths** |
| `verification_status` | `record_location_verification` can promote to `verified` when positive count reaches 2; `locations` has no trigger directly maintaining this field | **Separate verification projection; not equivalent to bathroom status** |
| `verification_observation_count` | No direct writer established in this field-level pass; `location_verification_observations` has a summary-refresh trigger | **Writer needs direct function trace before refactor** |
| `verification_positive_count` | No direct writer established in this field-level pass; summary-refresh trigger is the likely projection path | **Writer needs direct function trace** |
| `verification_negative_count` | No direct writer established in this field-level pass; summary-refresh trigger is the likely projection path | **Writer needs direct function trace** |
| `verification_confidence` | No direct writer established in this pass; `kleenest_location_confidence()` computes a confidence score at read time | **Derived/read model unless another writer is found** |
| `accessible` | `apply_user_amenity_confirmation` can set true for matching positive amenity confirmations | **Amenity-derived projection; do not treat as independent evidence source** |
| `changing_table` | `apply_user_amenity_confirmation` can set true for matching positive amenity confirmations | **Amenity-derived projection** |

## Critical distinctions

### Bathroom status vs verification status

`bathroom_verification_status` is a bathroom-specific state and can be updated by several bathroom evidence paths. `verification_status` is a separate location verification state and is promoted by `record_location_verification` after enough positive bathroom verifications.

They must not be collapsed into one Architecture property without preserving the existing semantics.

### Evidence counts vs confidence

Bathroom positive/negative/count fields are accumulated projections. `kleenest_location_confidence()` derives a score using those counts plus reviews, sources, freshness, and contradictory observations. Confidence therefore should remain a derived capability unless a separate persisted writer is confirmed.

### Provenance

`bathroom_verification_source` differs by path (`user`, `trusted`, `community`, `community_verification`, etc.). Architecture must retain provenance rather than normalizing all writes to a generic `verified` state.

## Confirmed conflict

`record_bathroom_verification()` directly updates the location and, for a positive trusted verification, inserts `location_verification_points` and increments `profiles.points`. Meanwhile the `process_bathroom_verification` trigger definition explicitly states that gamification is the single authority for user reward points.

This is a **real authority conflict requiring reconciliation**. No cleanup should be performed until idempotency and intended reward ownership are established.

## Confirmed event implications

`submit_restroom_observation()` writes a server-authoritative `restroom_observation` feature event. `apply_user_amenity_confirmation()` writes an `amenity_confirmed` feature event. These events feed downstream event/Intelligence infrastructure and must not be duplicated by Architecture's client layer.

## Architecture recommendation

Do not make `locations` a free-form write surface in the new architecture. Introduce capability-level commands around evidence types, while keeping the resulting location fields as projections.

Recommended conceptual commands:

- `submitRestroomObservation`
- `submitAmenityObservation`
- `submitLocationQualityObservation`
- `submitCommunityVerification`
- `submitTrustedBathroomVerification`
- `ingestExternalObservation`

Each command must preserve its existing provenance, validation, event, and reward semantics. A future consolidation can share internal projection logic without erasing the distinctions between evidence classes.

## Remaining unknowns

The exact implementation of `refresh_location_verification_summary()` was not fetched in this pass, so the three `verification_*_count` fields remain explicitly unresolved rather than guessed. This is a deliberate audit stop condition.

No Production mutation was performed.
