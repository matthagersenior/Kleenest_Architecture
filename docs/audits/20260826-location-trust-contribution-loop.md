# Location Trust Contribution Loop

## Purpose
Turn weak location intelligence into targeted, useful consumer actions instead of generic review requests.

## Canonical loop

location → trust/freshness → missing evidence → contextual prompt → verified observation → intelligence refresh → improved trust → analytics/Quest

## Evidence priorities

1. Bathroom availability/open status
2. Accessibility
3. Cleanliness/quality
4. Amenities (stalls, urinals, sinks, changing table, etc.)
5. Verification/freshness
6. Photo/evidence where appropriate

## UX rule

The client should ask only for evidence that is missing, stale, conflicting, or materially valuable. Never require a review merely to improve a score.

## Ranking rule

Recommendation should combine distance with trust, freshness, access requirements, cleanliness, amenities and occupancy when available. Distance remains a constraint, not the sole ranking signal.

## Safety/trust rule

Predictions and confidence are explicitly labeled as estimates. Community observations cannot silently overwrite business-managed facts; business claims are authoritative only within their permitted fields and verification scope.

## Product value

Consumer: better decisions and fewer failed restroom stops.

Business: actionable restroom-health signals and measurable response improvement.

Platform: every useful consumer action improves the canonical location graph rather than creating another dataset.
