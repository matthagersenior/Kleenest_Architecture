# Batch AO — Blocker Status Reconciliation

Date: 2026-08-22

This is the authoritative status addendum to `batch-ao-full-architecture-audit.md`. The original audit preserves the point-in-time blocker snapshot; this document records later commits that changed those statuses.

## Resolved

### D — QR/check-in authority

Resolved at the architecture-contract level by:

- `9f368e89bbf83638897c6bd40ba84faceb65c171` — establish server-authoritative check-in capability.
- `cf8bd898ce72828cee3101aeb449de648fb53f43` — wire QR geofence and check-in routes.
- `24a5c803e35bef14aac95152876b3b67f291ba49` — align QR and cross-tier leaderboard RPC signatures.

The implementation must preserve the single authoritative check-in/reward path.

### E — bathroom verification authority

Resolved by `86f93fa6f3dfa9f7c2a0fd7d15fb3fb738110714` (`fix: consolidate bathroom verification authority`). The migration establishes verification rows as the event authority, `process_bathroom_verification()` as the location projection/state authority, and `gamification_activity_trigger()` as the reward authority.

### F — contest progression

Resolved at the contract/capability level by `c5ffb4511fc4f22dcda259ead0a2fc209e7bae05` plus progression contract reconciliation in `4abd881cc1d5e3ca6e3794ea59162c0d28e2ac7d` and `b82019eeb2ba184d0a7d7ba0427bd6795dd12000`.

### H — canonical location normalization/evidence path

Resolved for the canonical adapter path by:

- `d2c909639dbe219b5e2c70f738fe477b9b36f41b` — canonical location/place contract.
- `16b37db73134aa4f5072226503a0b716337af1e0` — map surface wired to canonical location network.
- `601bfee883626617999fe89dadc58be0338cd925` — canonical location evidence adapter.
- `36d1aae5faaa031e945bcdc235e9ed9bb699f7cd` — validate location evidence inputs.

Mutations requiring canonical `locations.id` must still fail closed when resolution is unavailable.

## Partially resolved

### B — favorites

Later commits established and wired the canonical consumer favorites path:

- `e6e2ba40a7f5e01e5e08a4357226850837428243` — canonical consumer favorites adapter.
- `8a2365a41cc2beb77de15bb10e6c5c184645d71b` — expose consumer favorites/reviews.
- `b9733bd05365b937de78a34eb90aa396d66d71ae` — wire consumer check-in/favorites/reviews/notifications.

The client/domain path is therefore converged. Final closure still requires explicit end-to-end verification that the authoritative Production favorite store is singular.

## Still open

### A — follows

No later architecture commit located establishes reconciliation of `follow_user()` with the canonical `follows` relationship store.

### C — check-in aggregation

The server-authoritative command path is established, but downstream profile/check-in aggregate effects still require explicit idempotency/duplicate-trigger verification.

## Security gates remain separate

The Partner benchmark authorization finding and SECURITY DEFINER classification work remain separate security gates until explicitly verified.

## Updated implementation gate

Broad implementation is no longer blocked by D, E, F, or H. B is partially resolved. A and C remain correctness gates. Security findings remain separate gates.
