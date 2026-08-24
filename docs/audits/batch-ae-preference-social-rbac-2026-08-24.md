# Batch AE — Preference/social RBAC

- Consolidated own-record RLS for notification preferences, push subscriptions, profile preferences, social posts/comments/likes/saves.
- Removed redundant overlapping policies after verifying live schema and policy state.
- Preserved public interaction reads only where the underlying social relationship exists.
- Preserved authenticated user-owned mutation semantics.
- Production migration verified successfully.
