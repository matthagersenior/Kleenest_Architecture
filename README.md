# Kleenest

Canonical reconstruction and forward source of Kleenest from the Production Supabase capability contract and verified product behavior.

## Source of truth

- **Kleenest_Architecture is the canonical source repository and the product being built forward.** Runtime source, domain services, capability contracts, UI surfaces, infrastructure, documentation, and verification live here.
- **Supabase Production** is the backend capability authority.
- **Kleenest_App** is a legacy/reference consumer: useful for discovering proven UI and behavior, but not authoritative over architecture or future implementation.
- New architecture and implementation work belongs here. Do not add new product implementation to Kleenest_App during the reconstruction/build phase.

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
11. The source repository is built forward in place; architecture and implementation are not separated into different repositories.
12. Reference behavior may be imported from Kleenest_App, but canonical ownership moves to this repository once implemented here.

## Current source status

The repository already contains the canonical React runtime, `AppContext`, `WorkspaceShell`, route/runtime surfaces, domain services, capability registry, infrastructure, and workspace-specific source trees. These are product source, not documentation-only architecture artifacts.

## Architecture and correctness status

The full ownership/dependency audit is recorded in `docs/audits/batch-ao-full-architecture-audit.md`, with later resolutions reconciled in `docs/audits/batch-ao-blocker-status-reconciliation.md`.

The repository is built forward through independently auditable large batches. Confirmed Production blockers are reconciled against later commits before being treated as blockers.

The only consistently genuine missing product layer discovered by the reconciliation is the **Fleet Business Metric Configuration** adapter. It must sit over existing Fleet measurements and shared progression/measurement primitives; it must not become a new metrics engine.

## Build order

1. Canonical architecture and capability contracts — established and continuously reconciled.
2. Canonical runtime and infrastructure — active source.
3. Maps/location/routing foundation.
4. Consumer surfaces and authoritative commands.
5. Business / enterprise / fleet surfaces.
6. Admin / intelligence / notifications / analytics.
7. Offline replay against the same authoritative commands.
8. Duplicate retirement and end-to-end verification.
9. Production promotion only after verification.

Work is performed in large cross-domain batches. A batch may span runtime, domain services, UI, backend contracts, events, and verification together; the requirement is traceability, not artificial single-goal isolation.

See `docs/capability-inventory.md`, `docs/consumer-parity-matrix.md`, `docs/architecture/interoperability-dependency-matrix.md`, and the audit files under `docs/audits/`.

<!-- Pages rebuild trigger: 2026-08-22 -->
