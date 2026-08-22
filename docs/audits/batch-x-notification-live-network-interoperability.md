# Batch X — Notification / Live Network interoperability audit

Date: 2026-08-22

## Confirmed production pipeline

Production has a trigger from `live_network_events` to `queue_intelligence_notification_jobs`. `notifications` separately has a trigger to `enqueue_notification_push_delivery`.

The resulting architecture is:

`live network event → intelligence job queue → worker → notification/delivery`

and separately:

`notification → push-delivery trigger → push worker`

These are asynchronous infrastructure stages, not one frontend RPC.

## Notification capabilities

Production exposes:

- `publish_intelligence_location_event(...)` — security-definer composite capability.
- `publish_location_notification(...)` — lower-level notification-event writer.
- `materialize_notification_event(...)` — privileged materialization stage.
- `enqueue_notification_push_delivery()` — privileged push-delivery entry.

These must remain different abstraction levels. A client capability must not substitute a low-level event insert for the composite intelligence publisher unless it explicitly owns every downstream stage.

## Live Network client surface

`src/services/liveNetwork.js` defines the live event vocabulary: user location views, directions, route starts, approaching/arrival/departure, QR check-in, location verification/staleness/conflict, business offers, and fleet events. It currently writes `live_network_events` directly and subscribes to INSERT changes.

The development log records a correction making Business Intelligence use the canonical `BUSINESS_OFFER_STARTED` event type and removing an unsupported `businessId` argument, confirming that the event vocabulary is an explicit contract.

## Realtime fan-out

`realtimeNetwork.js` subscribes to per-user `notifications` inserts and global `live_network_events` inserts. `NetworkRealtimeBridge.jsx` converts those database events into `kleenest:notification` and `kleenest:network-event` browser events. `NetworkEventToast.jsx` consumes both streams for UI feedback.

This establishes:

`Supabase realtime → bridge → application event bus → UI`

Architecture should preserve singleton subscription ownership rather than creating duplicate realtime channels per component.

## Live reaction layer

`liveReactions.js` maps live event types to notification, route opportunity, verification opportunity, fleet alert, and business opportunity reactions. It consumes the realtime stream and does not create another event source. It is therefore a derived reaction model.

## Risks / decisions

1. `live_network_events` is an event source; notifications are downstream products, not a second location authority.
2. Notification publication, materialization, and push delivery remain distinct infrastructure stages.
3. The live event vocabulary belongs in one canonical contract registry.
4. Realtime subscription ownership should be singleton-scoped.
5. Direct client inserts into `live_network_events` should eventually sit behind the Architecture capability boundary, after RLS/authorization verification.
6. Live reaction rules remain derived and must not publish duplicate events.
7. Notification dedupe keys are part of the contract and must survive wiring.

## Parity gaps

- Repository indexing does not prove every `publishLiveEvent` caller; do not interpret missing search hits as missing features.
- The exact authority for each live event type still needs explicit mapping between direct event writes and server notification publishers.
- The runtime mount of `NetworkRealtimeBridge` should be verified before consolidation.

No Production mutation was performed.
