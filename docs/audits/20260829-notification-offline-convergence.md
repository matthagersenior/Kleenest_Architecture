# Notification → Realtime → Offline Convergence — 2026-08-29

## Completed slice

The consumer continuity boundary is now explicitly verified as:

`authoritative notification → realtime subscription → offline replay → authoritative persistence → refresh`

## Notification authority

The notification inbox reads through `user_notifications` and mutates read state through authoritative RPCs. Realtime delivery is filtered to the authenticated user's notification rows and rejects a caller-supplied user ID that does not match the authenticated identity.

## Offline authority

Offline activity is stored in IndexedDB only as a replay queue/cache. Synchronization requires an authenticated session, checks for an existing authoritative replay by `client_event_id`, replays through canonical domain RPCs, and records the resulting authoritative replay in `offline_pack_events`. Replay attempts are bounded to prevent infinite retry loops.

## Refresh convergence

Notifications now refresh after `kleenest:offline-synced`, in addition to intelligence, rewards, check-in, Fleet, and business notification events. Realtime notification inserts still update the inbox immediately.

## No client-owned authority

Offline cache entries are not treated as authoritative state. A successful replay is established by the server mutation and recorded with its client event identity; the UI then refreshes from authoritative notification state.

## Remaining certification

The final runtime pass should exercise an authenticated browser/device session through offline transition → queued event → reconnect → replay → notification/realtime refresh, and verify the same client event cannot create duplicate authoritative outcomes.
