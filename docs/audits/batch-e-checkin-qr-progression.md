# Batch E — Check-in / QR / progression parity

Production RPC inventory confirms that check-in and progression are server-authoritative capabilities.

## Canonical check-in RPCs

- `create_check_in(p_place_id, p_qr_token)`
- `record_gps_checkin(p_lat, p_lng, p_radius_meters)`
- `kleenest_map_check_in(p_location_id, p_lat, p_lng)`
- `verify_checkin(p_qr_code, p_lat, p_lng)`
- `checkin_rewards_summary(p_checkin_id)`

These are exposed through `domains/checkins/checkins.js`; Architecture does not write directly to `check_ins`.

## Canonical QR RPCs

- `consume_single_use_qr(p_code, p_user_id)`
- `redeem_qr_code(p_code)`

These are exposed through `domains/qr/consumer.js`. Business QR management remains a separate business capability and is not mixed into the consumer scanner contract.

## Canonical progression RPCs

- `user_rewards_history(p_limit)`
- `review_rewards_summary(p_review_id)`
- `checkin_rewards_summary(p_checkin_id)`
- `complete_progression_challenge(p_challenge_id)`
- `refresh_contributor_milestones(p_user_id)`

These are exposed through `domains/rewards/progression.js`.

## Architecture rule

The client requests capability operations through RPCs and does not manufacture reward transactions, check-in rows, milestone awards, or QR redemption records locally.

## Remaining audit

Challenge/contest discovery, reward catalog/promotion redemption, contributor reputation, and business reward administration remain separate capability clusters and should be audited before being merged into progression.
