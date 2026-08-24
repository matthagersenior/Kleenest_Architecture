# Batch AB — authoritative client mutation lockdown

Date: 2026-08-24

Mass security hardening pass. Direct INSERT/UPDATE/DELETE/TRUNCATE privileges were revoked from anon/authenticated on authoritative telemetry, progression, rewards, intelligence, discovery, route, leaderboard, and derived-state tables. Legitimate user-facing preference/social tables were intentionally left for separate scoped review.

Production privilege verification after migration still reports remaining client-write tables, which are now the next classification set rather than being blindly revoked.
