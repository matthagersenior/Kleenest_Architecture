# Batch Z — Check-in integrity

Date: 2026-08-24

## Production changes

- GPS map check-ins now validate coordinate ranges and use a server-side geofence derived from the location.
- GPS check-ins are idempotent within the existing 10-minute anti-replay window.
- GPS check-ins now feed progression and metric telemetry through the existing authoritative paths.
- Location visits require an active location and are idempotent within a 10-minute window.
- Preferred-location usage counters are updated only for the authenticated caller's own activation.

## Architecture invariant

`authenticated user → validated location → server-side proximity → idempotent check-in → authoritative reward/telemetry`

Client-supplied coordinates and identifiers cannot directly establish another user's check-in identity.

## Follow-up

Continue auditing QR check-ins, check-in rewards, review eligibility, quest triggers, and downstream attribution for replay or cross-user state mutation.
