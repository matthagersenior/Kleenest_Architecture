# Batch AA — Verification summary and consumer audit

Date: 2026-08-22

## New confirmed backend finding

`refresh_location_verification_summary(uuid)` is the canonical projection writer for the broader location-verification summary fields:

- `verification_observation_count`
- `verification_positive_count`
- `verification_negative_count`
- `verification_confidence`

It counts rows from `location_verification_observations` and updates the corresponding `locations` row. The trigger `trg_refresh_location_verification_summary` invokes it for inserts/updates/deletes on `location_verification_observations`.

### Consequence

These four fields should be modeled as a **projection**, not direct client-owned state.

`verification_confidence` in this projection is specifically the positive/open/public ratio from `location_verification_observations` rounded to three decimals. It is NOT the same thing as the separate `kleenest_location_confidence()` score.

## Two different confidence concepts are confirmed

### Verification confidence

Persisted on `locations.verification_confidence` by the verification-observation summary trigger. It answers, essentially, how positive the location-verification observations are.

### Location confidence

`kleenest_location_confidence(location_id)` is a read-time derived score from 0–100. It combines bathroom status, bathroom positive/negative evidence, reviews, source count, evidence freshness, and contradictory amenity observations, and returns a qualitative level (`unknown`, `low`, `moderate`, `high`, `trusted`).

These must remain distinct in Architecture. A generic `confidence` property would be dangerous because it would erase the meaning of the two scores.

## Consumer audit

The active GitHub app has a universal discovery service that calls `prepare_universal_location_discovery` and maps `bathroom_verification_status` / `verification_status` into a UI-level `is_verified` boolean. This is a **presentation projection** and intentionally simplifies two backend statuses for discovery UI. It must not be written back to Supabase.

`MapSurface` also independently computes its verified filter from `is_verified`, `bathroom_verification_status`, or a `verification_confidence >= .8` threshold. This is an important interoperability risk because it combines different backend semantics into one UI rule.

### Recommended Architecture contract

Expose separate normalized fields:

- `bathroomVerificationStatus`
- `locationVerificationStatus`
- `verificationObservationConfidence`
- `locationConfidenceScore`
- `locationConfidenceLevel`

Then define a single UI helper for a display-only `isVerified` policy. Feature code should not independently invent thresholds.

## Existing app matrix implications

The repository's interoperability matrix states that locations are the shared identity for Map, Place, Route, Business, Enterprise, and Fleet; evidence enriches the same location; and cached/offline data must never become a competing authority. This audit reinforces those rules.

Universal discovery should remain the canonical retrieval path for shared location identity, while Map/Place/Business/Fleet consume the normalized result rather than each implementing their own verification semantics.

## Remaining work

1. Find every consumer of `verification_confidence` and `verification_status` in the repository.
2. Identify any UI threshold that differs from the canonical product definition.
3. Trace `prepare_universal_location_discovery` output to ensure it exposes both verification concepts without ambiguity.
4. Build the Architecture normalized location contract before wiring Map/Place/Business/Fleet consumers.

No Production mutation was performed.
