# Batch AG — Sensitive RPC exposure

Date: 2026-08-24

- Removed authenticated EXECUTE from legacy/internal attribution, leaderboard, enterprise metric, external-enrichment, and verification-target RPCs that are not client capability boundaries.
- Re-verified the targeted functions have no authenticated EXECUTE privilege.
- Preserved explicit application RPCs used by consumer, business, fleet, enterprise, routing, QR, progression, and review flows.
