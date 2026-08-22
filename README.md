# Kleenest Architecture

Canonical reconstruction of Kleenest from the Production Supabase capability contract and verified product consumers.

## Source of truth

- **Supabase Production** is the backend capability authority.
- **Kleenest_App** is a reference consumer: useful for discovering existing UI, service contracts, and proven behavior, but not authoritative over architecture.
- This repository is the canonical target. Legacy duplication is not copied forward merely because it exists.

## Operating rules

1. Every user-visible action terminates in a real capability.
2. One canonical implementation per capability.
3. Authorization and entitlements are explicit parts of capability contracts.
4. Protected writes use the backend authority/RPC or Edge Function rather than arbitrary direct table mutation.
5. UI surfaces consume domain capabilities; they do not become capability owners.
6. Maps/location intelligence is foundational.
7. Duplicate implementations are catalogued before being removed.
8. Large batches are safe only when each batch is independently auditable.
9. Server triggers, projections, workers and reward paths are part of capability correctness.
10. Production is not the test harness.

## Architecture audit status

The full ownership/dependency audit is recorded in `docs/audits/batch-ao-full-architecture-audit.md`.

**Architecture contract:** ready for implementation.

**Broad UI wiring:** gated until the confirmed authority/correctness blockers in that audit are reconciled in an isolated Supabase development environment.

The only consistently genuine missing product layer discovered by the reconciliation is the **Fleet Business Metric Configuration** adapter. It must sit over existing Fleet measurements and shared progression/measurement primitives; it must not become a new metrics engine.

## Build order

1. Canonical architecture and capability contracts — complete.
2. Backend authority/correctness fixes in isolated development — required before affected wiring.
3. Canonical runtime and infrastructure.
4. Maps/location/routing foundation.
5. Consumer surfaces and authoritative commands.
6. Business / enterprise / fleet surfaces.
7. Admin / intelligence / notifications / analytics.
8. Offline replay against the same authoritative commands.
9. Duplicate retirement and end-to-end verification.
10. Production promotion only after verification.

See `docs/capability-inventory.md`, `docs/consumer-parity-matrix.md`, `docs/architecture/interoperability-dependency-matrix.md`, and the audit files under `docs/audits/`.
