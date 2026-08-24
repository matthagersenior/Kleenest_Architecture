# Batch AA — Gamification event idempotency

Date: 2026-08-24

- Added a unique source/event constraint for downstream data-feature events.
- Removed pre-existing duplicate source/event telemetry rows before enforcing uniqueness.
- Updated feature-event capture to assign deterministic deduplication keys and use conflict-safe insertion.
- Check-in, review, photo, visit, route, QR, filter, and Fleet-originated feature events now cannot be duplicated by repeated trigger execution for the same source record/event.
- Existing point-transaction uniqueness constraints remain authoritative for reward idempotency.

Production migration: `dedupe_checkin_downstream_events`.
