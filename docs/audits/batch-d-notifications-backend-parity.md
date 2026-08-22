# Batch D — Notifications / intelligence backend parity

## Production authority verified

Production currently has active Edge Functions for intelligence generation/delivery and push delivery. The active `deliver-intelligence-notification` function authenticates the caller with the user's Supabase session and delegates notification creation to `create_intelligence_notification`.

The active push worker is deliberately different: it uses a worker secret and service-role access to deliver records from `notifications` to `notification_push_subscriptions`, while recording delivery state in `notification_push_deliveries`.

## Architecture boundary

`src/domains/notifications/intelligence.js` owns the authenticated client-side creation contract for intelligence notification candidates. It does not reproduce the server-side notification generator or push worker.

This keeps:

- intelligence generation server-side
- notification persistence server-authoritative
- push delivery worker-only
- client notification requests authenticated

## Security observation

`deliver-push-notification` is intentionally deployed without JWT verification and implements its own worker-secret authorization. Architecture must never call it as a normal user-facing Supabase function or expose the worker secret.

## Next

Continue the progression/rewards/check-in audit, then map notification reads/subscriptions and live events into the same domain boundary.
