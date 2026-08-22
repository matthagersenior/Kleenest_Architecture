# Batch A — Identity / Authentication / Entitlements Audit

Date: 2026-08-22

## Evidence reviewed

Production capability inventory:
- `profiles`
- `subscription_plans`
- `subscriptions`
- `account_service_entitlements`
- `user_feature_entitlements`
- `feature_catalog`
- `feature_access_events`
- `pricing_catalog`
- `pricing_plans`
- `pricing_family_catalog_v1`
- `demo_identity_registry`
- `account_deletion_requests`

Reference consumer:
- `src/lib/supabase.js`
- `src/services/auth.js`
- `src/services/profile.js`
- `src/context/AuthContext.jsx`
- `src/domain/capabilities.js`

## Findings

### Authentication — YELLOW

The reference app has a coherent authentication consumer for current-user lookup, email/password sign-up and sign-in, Google OAuth, local sign-out, password reset, password update, and metadata updates.

The redirect URL construction is coupled to `/Kleenest_App`; this must not be copied into Architecture. Redirects belong to the application/runtime configuration boundary.

### Profiles — YELLOW

The reference profile service reads a defined profile projection and supports upsert. Architecture should preserve the read model but must verify Production write policy before treating arbitrary profile upsert as canonical. Protected writes remain subject to the backend/RLS/RPC boundary.

### Entitlements — YELLOW

The reference AuthContext calls `get_current_user_product_entitlements` and combines those results with profile role/subscription information. This is the strongest evidence that entitlement resolution is already intended to be a cross-cutting runtime capability rather than a page concern.

### Capability normalization — ORANGE

The reference implementation derives `consumer`, `premium`, `business`, `fleet`, `enterprise`, and `admin` capabilities from role/profile flags and entitlement fields. It is useful behavior evidence, but Architecture must not assume these derived rules are the complete Production entitlement contract without verifying the Production feature catalog and entitlement semantics.

### Pricing — RED/YELLOW boundary

Production exposes pricing/catalog tables, but no dedicated pricing consumer was established during this batch. Pricing should therefore be represented as a backend-backed read capability, not reconstructed from profile subscription fields.

### Account deletion — RED

`account_deletion_requests` exists in Production. No verified reference consumer was established during this batch. Do not expose a deletion UI until the protected operation and lifecycle are verified.

## Canonical Architecture decisions

1. `identity` owns session/user/profile orchestration.
2. `entitlements` owns capability access evaluation.
3. `pricing` owns pricing/catalog reads.
4. UI must consume an identity snapshot; it must not independently query roles, subscription tiers, and entitlement tables.
5. Capability checks accept normalized capability/access results rather than duplicating role logic.
6. Protected identity/account mutations must use the Production-authorized path.
7. Application redirect paths are runtime configuration, never domain logic.
8. Legacy capability names may be normalized at the boundary, but internal Architecture contracts use canonical names.

## Batch A implementation target

```text
identity/
  auth
  profile
  session

entitlements/
  access
  catalog
  evaluation

pricing/
  catalog
```

The next implementation batch should replace the reference app's implicit combination of profile flags + entitlement fields with an explicit Architecture identity snapshot and entitlement evaluator.
