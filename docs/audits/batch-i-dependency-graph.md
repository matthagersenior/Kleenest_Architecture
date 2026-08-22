# Batch I — Live Supabase dependency graph

## Result

Production has substantial trigger-driven interoperability. The final runtime must treat these downstream effects as part of each capability contract.

## Critical dependency chains

### Check-in

`create_check_in` resolves Place → Location, inserts `check_ins`, writes reward/profile/event state, and the insert additionally fires `process_check_in`, gamification, and feature-event capture.

The client must never duplicate points, profile totals, gamification, or feature-event capture after a successful check-in.

### GPS check-in

`record_gps_checkin` performs spatial proximity against `locations`, inserts `check_ins`, and invokes progression helpers. The normal check-in trigger chain also applies.

### QR redemption

`redeem_qr_code` → `qr_codes` → `create_check_in` → `qr_redemptions` → `record_qr_attribution`. QR redemption also produces a feature event through its trigger.

`verify_checkin` is a second QR check-in authority and independently inserts a check-in. The runtime must distinguish these pathways to prevent duplicate rewards/check-ins.

### Review

`create_review` → `reviews` → gamification, business notification, profile review counter, location rating/cleanliness refresh, and feature-event capture.

The client must not independently update those downstream aggregates.

### Verification

`record_location_verification` inserts `location_bathroom_verifications`, whose trigger updates `locations` and invokes gamification. The RPC itself also updates the same location bathroom aggregates. This is a **double-write/semantic duplication risk** that must be tested before wiring.

### Live Network

`live_network_events` → `queue_intelligence_notification_jobs` → consumer/business/fleet intelligence jobs. This is a major bridge between live events, intelligence, and notifications.

### Notifications

`notifications` → `enqueue_notification_push_delivery` → push Edge Function.

Messages separately trigger notifications. Reviews trigger business notifications. Notification creation is therefore shared downstream infrastructure.

### Gamification / progression

Check-ins, reviews, favorites, verifications, social posts, contest entries, route events, and selected analytics events can feed gamification. Progression helpers can also create point transactions and update profiles/streaks.

Architecture must select one authoritative path per activity and avoid double-awarding points.

## Critical findings

1. **`follow_user` is a real defect candidate.** Its body explicitly inserts into `user_follows`, while the live RLS inventory is centered on `follows`. Reconcile schema/function before wiring follows.
2. **Check-in points are multi-path.** `create_check_in` inserts reward state, `process_check_in` sets displayed points, and AFTER INSERT gamification/progression can award additional points. UI must consume authoritative results and never calculate rewards.
3. **QR has two check-in authorities.** `redeem_qr_code` calls `create_check_in`; `verify_checkin` independently inserts a QR check-in. Define one runtime abstraction with explicit semantics.
4. **Verification has overlapping aggregate writes.** `record_location_verification` updates bathroom counters while its insert trigger also updates them. Reconcile/test before wiring.
5. **`record_data_feature_event` is generic while many source tables automatically emit feature events.** Prefer source-table mutations as telemetry authority and use the generic RPC only for events without an authoritative source row.
6. **Notification push is downstream infrastructure.** UI must never call the push worker directly.
7. **Offline packs are server-authoritative snapshots.** Offline should consume the server materialization rather than reimplementing selection semantics.

## Gate

**NOT READY TO WIRE.** Resolve the correctness items above, then run end-to-end simulations for check-in, QR, review, verification, favorite, follow, live event, notification, and offline flows.
