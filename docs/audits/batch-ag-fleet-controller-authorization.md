# Batch AG — Fleet controller authorization and configurability audit

Date: 2026-08-22

## Supabase capability findings

The Fleet API is business-scoped. Existing functions accept `p_business_id` and include authorization-aware operations such as `has_fleet_access`, `fleet_actor_is_manager`, driver/vehicle/route status controls, maintenance completion, alert resolution, Fleet dashboards, service opportunities, and route notifications.

Business membership has an explicit role enum: `owner`, `admin`, `manager`, `staff`, `analyst`. Membership-management commands include invitation, role changes, and removal.

## Architecture implication

Fleet controller configuration should be **business-scoped and role-aware**, not user-global.

A controller configuration needs at least:

```text
business_id
configured_by
metric/goal definition
scope (fleet/team/driver/vehicle/route)
visibility
editable roles
active period
status
```

The configuration is not itself a Fleet operational fact and must not modify driver/vehicle/route facts.

## Capability separation

The existing authorization model suggests three distinct permissions that should not be collapsed:

1. **Observe** — view Fleet metrics/data.
2. **Configure** — change metric definitions, goals, thresholds, dashboards, or scoring configuration.
3. **Operate** — mutate operational state such as driver/vehicle/route status, resolve alerts, complete maintenance.

Do not assume `has_fleet_access` alone is sufficient for configuration authority.

## Shared framework boundary

The shared progression/gamification framework is user-centric in its reward functions. Fleet configuration should therefore remain business-owned and reference shared metric primitives rather than creating private gamification state.

```text
Business membership / role
        ↓
Fleet controller authorization
        ↓
Metric configuration
        ↓
Shared measurement engine
        ↓
Fleet-scoped KPI / goal / score
```

An optional reward mapping can cross into user gamification only through an explicit, authorized adapter.

## Interoperability requirements

The Architecture contract should carry both the canonical metric definition/value and the authorization context under which the value/configuration is visible or editable. Cached client state must not be treated as proof of permission; server/RLS authorization remains authoritative.

## Capability gap to verify before wiring

The current Supabase audit found Fleet access/manager checks and business roles, but did not establish a dedicated Production metric-definition/configuration table or RPC for controller-created metrics. This is a **gap to verify**, not permission to invent a schema.

The next reconciliation step is to audit the existing GitHub Fleet controller UI and Supabase objects for hidden configuration paths, JSON configuration, settings tables, or RPCs that already provide this behavior.

## Architecture conclusion

Fleet is a customizable business platform with role-aware configuration layered over canonical operational facts and shared measurement primitives. Authorization is a separate dimension from measurement and operation.

No Production mutation was performed.
