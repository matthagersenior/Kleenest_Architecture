# Canonical Capability Contract

Every Architecture domain must implement the same conceptual contract. The exact TypeScript shape may evolve, but the boundaries do not.

```text
Capability
├── caller class
│   ├── public
│   ├── authenticated
│   ├── privileged
│   └── worker
├── identity
│   ├── actor
│   ├── account
│   └── role
├── entitlement
│   ├── feature
│   └── access decision
├── read
│   ├── input
│   └── result
├── write
│   ├── input
│   ├── authorization
│   ├── authority
│   └── result
├── side effects
│   ├── events
│   ├── projections
│   ├── notifications
│   └── analytics
├── failure
│   ├── validation
│   ├── authorization
│   ├── entitlement
│   └── infrastructure
└── lifecycle
    ├── initialize
    └── teardown
```

## Rules

### Caller class
Every backend boundary must identify who is allowed to invoke it. Worker/materialization/delivery primitives are not ordinary client capabilities merely because an RPC exists.

### Reads
Reads may use the canonical public/read surface exposed by Supabase. The domain owns query composition and normalization so pages do not invent competing queries.

### Writes
A write must identify its authority:

1. direct table write only when the Production contract intentionally permits it;
2. RPC when authorization/business rules are encoded there;
3. Edge Function when server-side secrets, privileged access, ingestion, or protected orchestration is required.

### Authority
A canonical mutation occurs once. If triggers/server functions already produce counters, rewards, feature events, notifications or projections, client code must consume those results rather than reproduce them.

### Identity
The browser must not manufacture identity. The capability receives the authenticated actor/account context from the canonical identity runtime.

### Entitlements
Access checks belong at the capability boundary. UI gating is a presentation optimization, not the security boundary.

### Events and projections
A successful mutation that participates in progression, analytics, notifications, intelligence, or cross-surface synchronization must expose the resulting event/projection contract rather than asking individual pages to reconstruct it.

### Runtime ownership
A capability must be safe to initialize once, reuse, and tear down. No page may create a second competing singleton for the same capability.

## Canonical domain map

```text
core/
  identity
  entitlements
  runtime
  events
  errors

locations/
discovery/
quality/
verification/
ingestion/
maps/
routing/
offline/
checkins/
reviews/
favorites/
qr/
social/
messaging/
family/
progression/
rewards/
contests/
contributors/
business/
partners/
enterprise/
fleet/
intelligence/
notifications/
analytics/
admin/
support/
```

## Fleet configuration boundary

Fleet controller configuration is business-scoped and role-aware. It configures metric definitions, goals, thresholds, scoring and scope over shared measurements. It does not own operational facts, generic feature-catalog configuration, or the shared measurement engine.

Required conceptual separation:

`Observe` ≠ `Configure` ≠ `Operate`.

This contract intentionally does not invent Supabase RPC names or tables for the missing Fleet configuration layer. Its Production implementation must be designed and tested separately.

## Caller-class registry requirement

Every capability entry in the governed catalogue must carry a `caller_class` classification. Use:

- `public` — intentionally callable without an authenticated identity;
- `authenticated` — callable by a signed-in actor subject to normal entitlement/role checks;
- `privileged` — a protected command requiring domain/business/enterprise authorization beyond generic authentication;
- `worker` — internal orchestration, materialization, delivery, ingestion, cache/lease, or other infrastructure not exposed as a browser capability.

A capability may not be promoted from `worker` to a browser-facing class solely because a UI feature would be convenient. Verify the caller and authorization contract first.

For live-network capabilities, distinguish product commands from infrastructure primitives. Route publication may be a privileged Fleet/Enterprise command; notification queueing, delivery materialization, raw recipient resolution, and identity/cache primitives default to `worker` until a verified public caller contract exists.

## Verification gate

Before changing grants, deleting a capability, or exposing a backend primitive to the browser, trace:

`UI/runtime → domain service → capability → authorization → Supabase/Edge Function → side effects → state refresh → telemetry`

Absence from code search is `unverified`, not proof of orphan status. Migration/history and worker callers must be checked before destructive changes.

This contract is intentionally independent of React. React pages/components are consumers of these domains.
