# Canonical Capability Contract

Every Architecture domain must implement the same conceptual contract. The exact TypeScript shape may evolve, but the boundaries do not.

```text
Capability
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
│   └── result
├── side effects
│   ├── events
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

### Reads

Reads may use the canonical public/read surface exposed by Supabase. The domain owns query composition and normalization so pages do not invent competing queries.

### Writes

A write must identify its authority:

1. direct table write only when the Production contract intentionally permits it;
2. RPC when authorization/business rules are encoded there;
3. Edge Function when server-side secrets, privileged access, ingestion, or protected orchestration is required.

### Identity

The browser must not manufacture identity. The capability receives the authenticated actor/account context from the canonical identity runtime.

### Entitlements

Access checks belong at the capability boundary. UI gating is a presentation optimization, not the security boundary.

### Events

A successful mutation that participates in progression, analytics, notifications, intelligence, or cross-surface synchronization must expose the resulting event/side-effect contract rather than asking individual pages to reconstruct it.

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
  discovery
  quality
  verification
  ingestion

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

This contract is intentionally independent of React. React pages/components are consumers of these domains.
