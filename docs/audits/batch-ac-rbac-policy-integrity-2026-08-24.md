# Batch AC — RBAC/policy integrity

Date: 2026-08-24

- Removed anonymous feedback mutation access where authenticated identity is required.
- Tightened social comment ownership on insert/update.
- Preserved user-owned notification/profile preference mutations through RLS.
- Preserved recipient-only message state updates and sender identity enforcement.
- Preserved authenticated support submissions and own-record visibility.
- Verified client mutation grants against live RLS policies after migration.

No schema assumptions were introduced for columns absent from the live social-post schema.
