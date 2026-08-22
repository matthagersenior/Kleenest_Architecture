# Batch J — Authority conflict resolution

## Verified findings

### Follows — BLOCKER

`follow_user(p_user_id)` currently inserts into `public.user_follows(follower_id, followed_id)`. The live schema exposes `public.follows(follower_id, following_id)` as the canonical relationship table and no `user_follows` table. Do not wire follows until the database function is reconciled with the canonical table.

### Check-in — BLOCKER

`create_check_in` resolves Place → Location, enforces a 24-hour duplicate window, inserts the check-in, writes reward state, increments profile state, and writes a feature event. Its check-in insert also invokes `process_check_in`. `process_check_in` increments `profiles.total_check_ins` again. Therefore total-check-in aggregation is at risk of double counting.

`record_gps_checkin` is a separate path with a 10-minute duplicate window and invokes progression helpers after insert. It should be normalized behind the Architecture check-in contract while preserving GPS-specific verification semantics.

### QR — BLOCKER

`redeem_qr_code` calls `create_check_in`, then inserts `qr_redemptions` and records QR attribution. `verify_checkin` independently inserts `check_ins` and invokes `record_progression_action('qr_scan', ...)` plus `record_progression_metric_event('qr_scan', ...)`.

These are not interchangeable implementations. Architecture must expose distinct operations or a single operation with explicit mode and prevent one physical scan from entering both reward pathways.

The database has a unique `(qr_code_id,user_id)` constraint on `qr_redemptions`, providing redemption idempotency, but it does not prevent the separate `verify_checkin` path from creating another check-in.

### Bathroom verification — NEEDS RECONCILIATION

`record_location_verification` directly updates bathroom aggregates on `locations`. The `process_bathroom_verification` trigger also updates the same aggregates after insertion. This can double increment counts. The trigger no longer awards gamification, so the conflict is specifically aggregate state.

A unique `(user_id, location_id)` constraint prevents multiple verification rows for the same user/location.

### Progression — GOOD IDEMPOTENCY FOUNDATION

`record_progression_action` checks `point_transactions` by `(user_id, reason, reference_id)` before awarding points. `point_transactions` has unique indexes enforcing that relationship. `record_progression_metric_event` supports metadata idempotency keys via a unique index.

Architecture should pass stable source IDs/idempotency keys rather than inventing client-side deduplication.

## Data model opportunities

- `check_ins` has QR and user/location/time indexes, supporting recent activity and attribution queries.
- `qr_redemptions` has user and QR indexes plus unique per-user redemption, making QR conversion analytics straightforward.
- `data_feature_events` has location, actor, business, feature, subject, event-type, and deduplication indexes, making it the natural cross-domain telemetry spine.
- `progression_metric_events` has source and user indexes plus idempotency, making it suitable for derived progression analytics without becoming the source of truth for the underlying activity.

## Current production data safety

The checked production tables currently contain zero rows in `follows`, `check_ins`, `location_bathroom_verifications`, and `qr_redemptions`; `point_transactions` contains 44 rows. This means the discovered conflicts can be resolved without needing to migrate existing follow/check-in/verification/QR records in this environment, but production DDL should still not be used as the test harness.

## Gate

**NOT READY TO WIRE.**

Required before wiring: reconcile `follow_user`, eliminate/check-in aggregate double counting, define QR pathway authority, and reconcile bathroom aggregate writes. Then execute end-to-end tests against a Supabase development branch rather than mutating production.
