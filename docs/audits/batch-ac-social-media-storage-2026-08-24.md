# Batch AC — Social media/storage integrity

Date: 2026-08-24

- Social comments are now publicly readable only when published or by their author.
- Social comment creation remains authenticated and self-attributed.
- Social post creation/update now requires media storage paths to belong to the authenticated user's storage namespace when media is supplied.
- Existing public social-post visibility was preserved because the live `social_posts` schema has no publication/status column; no fabricated status dependency was introduced.
- Direct client grants remain constrained by the existing RLS ownership policies.
