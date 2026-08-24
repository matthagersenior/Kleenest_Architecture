# Kleenest Product Split & Wiring Contract — 2026-08-24

## Canonical product model

### User application
- Free — core consumer experience, advertising enabled.
- Premium — consumer experience, advertising suppressed.
- Fleet User — consumer experience plus Fleet workspace/capabilities.
- Enterprise User — consumer + Fleet + Enterprise capabilities; Enterprise presentation may be customized.

### Business application
- Standard — core business management.
- Growth — Standard plus Enterprise tooling.
- Fleet — Growth plus Fleet operational tooling.
- Enterprise — advanced analytics plus Fleet capability.

The two applications share one Platform Core: Supabase contracts, domain services, capability registry, entitlements, analytics, identity, maps, routing, offline, notifications, progression, and intelligence.

## Definition of done for a capability

`Supabase authority -> domain service -> UI surface -> entitlement -> authorization -> mutation/query -> returned state -> UI refresh -> feature telemetry -> outcome metric`

A capability is not considered complete merely because its table, RPC, service, or component exists.

## CRUD contract

The Owner CRUD surface is governed by `admin_crud_capability_catalog()` and `admin_crud_gateway()`. The UI must not maintain an independent list of writable resources. Read-only resources must not expose create/update/delete controls. Protected business/Fleet/Enterprise operations remain in their owning domain services.

## Interoperability rules

1. Supabase remains the authority for canonical business facts.
2. Analytics consumes canonical facts and feature events; it does not create shadow business facts.
3. Entitlements control UI visibility and backend authorization independently; both must agree.
4. Business Growth grants Enterprise tooling without requiring the Business application to become an Enterprise account.
5. Fleet is a user/business capability and may operate independently of Business ownership where the backend grants it.
6. Offline writes must queue client events and replay through authoritative RPCs.
7. QR actions must resolve to an authoritative backend operation before rewards/analytics are emitted.
8. Intelligence produces derived signals and action links; mutations remain owned by domain services.
9. UI navigation should expose one canonical workspace per product surface instead of duplicating equivalent command centers.
10. Every new capability must be registered in `src/architecture/capabilityRegistry.js` and `capabilityContract.js`.

## Audit priorities

- P0: UI ↔ Supabase contract parity, CRUD catalog parity, entitlement/authorization parity, broken navigation, mutation refresh.
- P1: feature adoption telemetry, product-tier enforcement, workspace consolidation, business lifecycle completeness, metric coverage.
- P2: additional intelligence, partner/network expansion, ad attribution/revenue metrics, deeper offline and enterprise customization.
