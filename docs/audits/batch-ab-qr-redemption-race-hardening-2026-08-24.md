# Batch AB — QR redemption race hardening

Date: 2026-08-24

- QR codes are locked during redemption to serialize redemption-limit checks.
- QR location resolution is validated before creating the check-in.
- Existing `(qr_code_id,user_id)` uniqueness remains authoritative for single-user redemption idempotency.
- Concurrent duplicate redemption is handled without creating a second redemption or attribution.
- Redemption attribution now references the actual redemption row ID.
