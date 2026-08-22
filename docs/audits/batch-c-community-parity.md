# Batch C — Community interaction parity

## Reference evidence

`Kleenest_App/src/services/community.js` currently combines reviews, restroom observations, check-in delegation, rewards reads, business review replies, review likes/photos, favorites, interaction state, arrival analytics, and directions analytics.

## Canonical Architecture boundary

The Architecture repo separates these concerns instead of reproducing the monolithic community service:

- `domains/community/interactions.js` — favorites, interaction state, reviews, review likes/replies, observation summaries.
- Check-ins remain a separate capability because the reference service delegates to the canonical check-in implementation.
- Rewards remain a separate domain because reward transactions are a distinct capability.
- QR remains a separate domain because QR is an input/authentication mechanism for check-in rather than a generic community operation.
- Analytics/events remain separate from user-facing mutations.

## Verified backend boundaries

The reference implementation demonstrates verified RPC boundaries for:

- `kleenest_toggle_favorite`
- `create_review`
- `toggle_review_like`
- `business_reply_review`

The reference implementation also reads canonical `reviews`, `check_ins`, `favorites`, and `restroom_observations` records.

## Deliberately not copied yet

Direct deletion of reviews, direct review-photo inserts/deletes, and any unverified check-in implementation are not promoted into Architecture until their Production authority/security contract is verified. The Architecture layer should not turn legacy direct table mutations into canonical APIs merely because the old client does so.

## Parity classification

| Capability | Reference consumer | Architecture | Status |
|---|---|---|---|
| Favorite location | `community.js` | `community/interactions.js` | Canonicalized |
| Interaction state | `community.js` | `community/interactions.js` | Canonicalized |
| List reviews | `community.js` | `community/interactions.js` | Canonicalized |
| Create review | `community.js` | `community/interactions.js` | Canonicalized around RPC |
| Like review | `community.js` | `community/interactions.js` | Canonicalized around RPC |
| Business review reply | `community.js` | `community/interactions.js` | Canonicalized around RPC |
| Observation summary | `community.js` | `community/interactions.js` | Canonicalized read |
| Check-in | delegated from `community.js` | separate domain | Pending dedicated audit |
| Review photos | direct storage/table writes | separate media capability | Pending authority verification |
| Review deletion | direct table delete | not promoted | Pending authority verification |
| Rewards | separate reward transaction read | separate domain | Pending progression batch |
| Arrival/directions events | event service | separate analytics/events domain | Pending event batch |
