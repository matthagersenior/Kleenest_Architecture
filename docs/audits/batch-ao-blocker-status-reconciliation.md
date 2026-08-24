# Batch AO — Blocker Status Reconciliation

Date: 2026-08-24

This is the authoritative status addendum to `batch-ao-full-architecture-audit.md`. The original audit preserves the point-in-time blocker snapshot; this document records later commits and current Production verification that changed those statuses.

## Resolved

### A — follows

Resolved by current Production verification. `follow_user(p_user_id uuid)` now inserts into `public.follows(follower_id, following_id)` with conflict protection and awards follow progression only for a new relationship. The application may therefore use `follow_user()` for creation while reads/deletion remain against the same canonical `follows` store.

### B — favorites

Resolved by current Production verification and application convergence. `kleenest_toggle_favorite(p_location_id uuid)` mutates `public.favorites`, while `my_favorite_locations()` returns the canonical favorite locations. The implementation must not read/write `location_favorites` for the same capability.

### C — check-in aggregation

Resolved by current Production verification plus the `dedupe_checkin_feature_event_authority` migration. `check_ins` has one BEFORE trigger for the displayed aggregate count, one AFTER gamification trigger for progression/reward, and one AFTER feature-event trigger. `create_check_in()` no longer performs a second explicit `data_feature_events` insert; the trigger is the single feature-event capture authority. The command remains idempotent for the existing 24-hour user/location window.

### D — QR/check-in authority

Resolved at the architecture-contract level. `redeem_qr_code()` delegates check-in creation to `create_check_in()`, while `verify_checkin()` also delegates to the same command after QR/location/geofence validation. QR redemption records attribution separately and does not create a second check-in authority.

### E — bathroom verification authority

Resolved. `record_bathroom_verification()` writes the verification event; `process_bathroom_verification()` owns the location projection; and the gamification trigger remains the reward authority. The trusted verification command no longer directly awards profile points.

### F — contest progression

Resolved at the contract/capability level. `join_contest()` owns membership only and explicitly delegates contest-entry reward ownership to the AFTER INSERT gamification trigger. Contest scoring reads authoritative progression/point state rather than creating a second reward path.

### H — canonical location normalization/evidence path

Resolved for the canonical adapter path. Mutations requiring canonical `locations.id` continue to fail closed when canonical resolution is unavailable.

## Security gates — current Production verification

### Partner benchmark authorization — resolved

`get_partner_network_benchmark(uuid,date,date)` is `SECURITY DEFINER`, pins its search path to trusted schemas, and now scopes results through the network's `owner_business_id` against the authenticated user's `business_members` membership. Anonymous execution is disabled; authenticated execution remains available.

### SECURITY DEFINER search paths — resolved

Production verification confirms all 323 public `SECURITY DEFINER` functions have an explicit search path. No public SECURITY DEFINER function remains unpinned.

### Anonymous SECURITY DEFINER execution — classified

Eight remaining SECURITY DEFINER functions are intentionally anonymous/public read capabilities: amenities catalog, cross-tier leaderboard, active contests, active events, QR engagement-program listing, map-nearby, nearby restrooms, and public data-catalog search. Privileged/admin/intelligence/notification command functions no longer have anonymous execution.

## Remaining review gates

The remaining interoperability review items are:

- live-event mutation authority;
- enterprise engagement mutation semantics;
- notification mark-all mutation;
- review-to-verification event semantics;
- Fleet Business Metric Configuration, which remains a genuine new model and must be implemented as a thin business-scoped adapter over existing Fleet measurements.

These are isolated capability review items, not generalized architecture blockers.

## Updated implementation gate

Broad implementation is no longer blocked by the original A–H correctness set or the previously identified partner benchmark / SECURITY DEFINER security findings. Continue capability-by-capability verification and do not promote a worker/internal primitive to a browser capability without a verified caller contract.
