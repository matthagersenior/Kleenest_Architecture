# Batch AH — internal RPC boundary

- Removed client EXECUTE from internal notification publishers and recipient resolution.
- Removed client EXECUTE from quest trigger/authoring internals and gamification activity/progression internals.
- Removed anonymous EXECUTE from feature-summary refresh.
- Verified migrations against the live function signatures; nonexistent signatures were excluded rather than fabricated.
