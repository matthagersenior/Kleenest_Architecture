# Batch AB — Social/user boundary hardening

Date: 2026-08-24

- Social comments, likes, and saves now require authenticated ownership and a real target post on insertion.
- Social comment updates retain ownership and target-post validation.
- Messages now reject self-targeted sender/recipient pairs at the RLS boundary.
- Notification preferences and push subscriptions remain strictly caller-owned.
- Profile preferences remain strictly caller-owned.

Production migration: tighten_social_interaction_targets_and_messages; tighten_notification_and_profile_direct_mutations.

Direct client mutation remains intentionally available only for user-owned interaction/state surfaces protected by RLS.
