# Batch AO — Blocker Status Reconciliation

Date: 2026-08-22

This is the authoritative status addendum to `batch-ao-full-architecture-audit.md`. The original audit preserves the point-in-time blocker snapshot; this document records later commits and current Production verification that changed those statuses.

## Resolved

### A — follows

Resolved by current Production verification. `follow_user(p_user_id uuid)` now inserts into `public.follows(follower_id, following_id)` with conflict protection and awards follow progression only for a new relationship. The application may therefore use `follow_user()` for creation while reads/deletion remain against the same canonical `follows` store. No second follow store is required.

### B — favorites

Resolved by current Production verification and application convergence. `kleenest_toggle_favorite(p_location_id uuid)` mutates `public.favorites`, while `my_favorite_locations()` returns the canonical favorite locations. The implementation must not read/write `location_favorites` for the same capability.

### C — check-in aggregation

Resolved by current Production verification plus the `dedupe_checkin_feature_event_authority` migration. `check_ins` has one BEFORE trigger for the displayed aggregate count, one AFTER gamification trigger for progression/reward, and one AFTER feature-event trigger. `create_check_in()` no longer performs a second explicit `data_feature_events` insert; the trigger is the single feature-event capture authority. The command remains idempotent for the existing 24-hour user/location window.

### D — QR/check-in authority

Resolved at the architecture-contract level by:

- `9f368e89bbf83638897c6bd40ba84faceb65c171` — establish server-authoritative check-in capability.
- `cf8bd898ce72828cee3101aeb449de648fb53f43` — wire QR geofence and check-in routes.
- `24a5c803e35bef14aac95152876b3b67f291ba49` — align QR and cross-tier leaderboard RPC signatures.

The implementation must preserve the single authoritative check-in/reward path.

### E — bathroom verification authority

Resolved by `86f93fa6f3dfa9f7c2a0fd7d15fb3fb738110714` (`fix: consolidate bathroom verification authority`). The migration establishes verification rows as the event authority, `process_bathroom_verification()` as the location projection/state authority, and `gamification_activity_trigger()` as the reward authority.

### F — contest progression

Resolved at the contract/capability level by `c5ffb4511fc4f22dcda259ead0a2fc209e7bae05` plus progression contract reconciliation in `4abd881cc1d5e3ca6e3794ea59162c0d28e2ac7d` and `b82019eeb2ba184d0a7d7ba0427bd6795dd12000`.

### H — canonical location normalization/evidence path

Resolved for the canonical adapter path by:

- `d2c909639dbe219b5e2c70f738fe477b9b36f41b` — canonical location/place contract.
- `16b37db73134aa4f5072226503a0b716337af1e0` — map surface wired to canonical location network.
- `601bfee883626617999fe89dadc58be0338cd925` — canonical location evidence adapter.
- `36d1aae5faaa031e945bcdc235e9ed9bb699f7cd` — validate location evidence inputs.

Mutations requiring canonical `locations.id` must still fail closed when resolution is unavailable.

## Remaining security/review gates

The Partner benchmark authorization finding and SECURITY DEFINER classification work remain separate security gates until explicitly verified.

Live-event mutation authority, enterprise engagement mutation semantics, notification mark-all mutation, and review-to-verification event semantics remain review items from the interoperability matrix; they do not block unrelated implementation batches.

## Updated implementation gate

Broad implementation is no longer blocked by A, B, C, D, E, F, or H. Security findings and the remaining review items are isolated gates and should be resolved when their corresponding capability is reached.
