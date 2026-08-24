# Batch AF — SECURITY DEFINER exposure hardening

Date: 2026-08-24

- Removed authenticated EXECUTE from internal authorization helpers and trigger-only functions.
- Removed authenticated EXECUTE from platform/business/fleet capability helpers that are internal predicates rather than client APIs.
- Removed client EXECUTE from profile/bootstrap and maintenance trigger helpers.
- Re-queried function privileges after migration; targeted internal functions now have no anon/authenticated EXECUTE grants.
- Preserved public/authenticated RPCs that represent actual application capabilities.
