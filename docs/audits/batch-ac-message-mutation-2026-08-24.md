# Batch AC — Message mutation boundary

Date: 2026-08-24

- Removed direct authenticated UPDATE access to `messages`.
- Added `mark_message_read(uuid)` as the authoritative recipient-only read-state mutation.
- Recipient identity is enforced server-side; callers cannot rewrite sender, recipient, content, or arbitrary message state through PostgREST UPDATE.
- Existing sender INSERT remains self-scoped and now rejects self-messaging.
