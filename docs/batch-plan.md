# Autonomous Architecture Batch Plan

The work is intentionally grouped so large numbers of similar tasks can be completed without repeatedly stopping for approval.

## Batch A — Identity / access

- audit auth service and AuthContext
- map profiles/subscriptions/entitlements/pricing
- define canonical identity provider
- define entitlement gate
- record every current consumer

## Batch B — Locations / maps / routing

- audit location/map/routing consumers
- identify canonical location query/read surfaces
- identify map discovery and ingestion boundaries
- define location normalization
- define route plan/stops/events contract
- define offline boundary

## Batch C — Consumer location actions

- check-ins
- reviews/photos/likes
- favorites
- QR scan/attribution/redemption
- verification and contributor observations

## Batch D — Social / communication

- follows
- posts
- likes/comments/saves/reports
- activity
- messages
- family

## Batch E — Progression

- points
- badges
- levels
- streaks
- actions/games/challenges
- contests
- reputation/milestones

## Batch F — Commercial surfaces

- businesses
- campaigns/events/promotions
- memberships/clubs
- certifications
- perks
- partner programs

## Batch G — Enterprise / Fleet

- enterprise networks/campaigns/outcomes
- fleet vehicles/drivers/routes
- alerts/maintenance/scorecards/metrics

## Batch H — Platform intelligence

- intelligence jobs
- action links
- notifications
- push subscriptions/delivery
- live network
- analytics/data features
- admin/support

## Batch execution rule

For each batch:

1. inspect Production authority;
2. inspect all known `Kleenest_App` consumers;
3. identify duplicate consumers;
4. classify parity;
5. write the Architecture contract;
6. only then implement code;
7. run validation/build checks where available;
8. commit as one coherent batch.

No speculative rewrites. No copying historical folders wholesale. No deleting the reference implementation while the Architecture contract is still being derived.
