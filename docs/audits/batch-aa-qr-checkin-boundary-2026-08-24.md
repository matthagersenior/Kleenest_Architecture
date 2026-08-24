# Batch AA — QR/check-in boundary

Date: 2026-08-24

- Removed direct client mutation privileges from check-ins, QR attribution events, QR codes, QR redemptions, and reviews.
- Preserved controlled RPC mutation paths.
- QR/check-in/review state is now forced through authenticated service functions rather than direct PostgREST writes.
- QR attribution requires an authenticated caller and is idempotency-aware.
- Check-in creation remains server-authoritative and replay-protected.
