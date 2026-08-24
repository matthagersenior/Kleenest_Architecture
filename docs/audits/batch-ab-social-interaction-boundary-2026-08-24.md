# Batch AB — Social interaction boundary

Date: 2026-08-24

- Tightened authenticated social comment, like, and save policies to self-scope mutations and validate referenced posts.
- Tightened feedback/support submission access to authenticated users where appropriate.
- Preserved user-owned preference/subscription mutation semantics through RLS.
- Removed unnecessary anonymous mutation privileges from support/feedback surfaces.
- Verified the attempted social policy update against the live schema; the post table does not expose a `status` column, so the policy was not applied with an invented column. Existing schema-compatible policies remain authoritative.

## Follow-up

Continue broad mutation/RLS classification across remaining public tables, with schema inspection before each policy change.
