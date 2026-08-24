# Batch Y — Live security hardening

Date: 2026-08-24

## Production changes

This batch records the live Supabase hardening applied during the continued authorization audit.

### Identity and attribution

- Self-scoped contributor milestone/reputation refresh operations now require the authenticated identity.
- Live network event actor identity is validated against the authenticated caller and authorized business/fleet/enterprise membership.
- Network leaderboard participation validates actor type and actor ownership.
- Data-feature events validate user, business, and fleet-vehicle subject scope.

### Notification boundary

- Intelligence location event publication requires authentication and a valid location.
- Notification radius is bounded to 1–50 km.
- Notification expiration is one hour.
- Notification recipient resolution is server-bounded.
- Direct client privileges on notification event/delivery tables were revoked.

### Enterprise / Fleet / business boundaries

- Direct client writes to authoritative Enterprise/Fleet/business tables were revoked.
- Direct client reads were removed from sensitive Fleet telemetry and private business tables where the service/RPC boundary is authoritative.
- Enterprise tables remain admin/table-locked where legitimate operator reads are provided through scoped RPCs.
- Fleet operational and route-update reads were tightened to Fleet/business authority.

### Consumer media / contribution integrity

- Direct client writes to location/reference contribution tables were removed while preserving intended public read surfaces.
- Photo submission is authenticated, location-bound, namespace-bound, and validates media metadata.
- Review likes require published reviews and self-scoped identities.
- Business media updates require business authority and authenticated storage namespace ownership.
- Business media deletion remains constrained by business → location → media ownership.

### Reward integrity

- Business progression perk rewards are only emitted when the underlying perk is newly inserted.
- Progression action rewards use database idempotency to prevent replay/race-condition point inflation.

## Architecture invariant

Authoritative mutation now follows:

`UI → domain service → authenticated/scoped capability → RPC → authoritative state → refresh/telemetry`

Sensitive read paths use the same capability boundary rather than exposing raw tables unnecessarily.

## Verification

Production function definitions, role privileges, RLS policies, and table grants were queried after the applicable migrations. Direct client privileges were revoked from the sensitive domains listed above.

## Follow-up

Continue auditing check-in eligibility and reward propagation, then perform the consolidated security/advisor sweep. Remaining SECURITY DEFINER functions should be classified as fixed, intentionally public, authenticated/scoped, platform-only, or remaining defect.
