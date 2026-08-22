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

## Current build order

1. Capability inventory
2. Consumer/parity audit
3. Canonical domain contracts
4. Runtime and infrastructure
5. Maps/location/routing foundation
6. Consumer surfaces
7. Business / enterprise / fleet surfaces
8. Admin and intelligence
9. Duplicate retirement

See `docs/capability-inventory.md` and `docs/consumer-parity-matrix.md`.
