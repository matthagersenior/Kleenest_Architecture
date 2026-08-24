# Batch AD — Social visibility hardening

Date: 2026-08-24

- Hardened public interaction reads to require an existing social post relationship.
- Preserved authenticated ownership access for the user's own comments/saves.
- Verified RLS remains enabled on social posts, comments, likes, and saves.
- Removed schema assumptions after validating the live social_posts columns.
