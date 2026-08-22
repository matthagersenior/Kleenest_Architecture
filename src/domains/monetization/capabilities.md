# Monetization and Entitlement Graph

## Capability families

- consumer subscriptions
- family premium inheritance
- business product access
- preferred-location access
- single-use access offers
- promotions/redemptions
- pricing/catalog

## Authority

Entitlement state is authoritative backend state. UI feature visibility is a projection and must not grant access by itself.

## Shared graph

account → product/subscription → entitlement → family/business context → capability gate → usage/redemption → analytics.

## Wiring status

Boundary added conceptually. RPC arguments, RLS, billing/provider synchronization, and inheritance semantics require verification before runtime wiring.
