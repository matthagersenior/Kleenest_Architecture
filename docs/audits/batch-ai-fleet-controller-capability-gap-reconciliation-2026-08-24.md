# Batch AI — Fleet controller capability gap reconciliation

Date: 2026-08-24

## Current status

The controller-authored Fleet metric-definition/configuration gap identified on 2026-08-22 is now **implemented in the Architecture repository** as a thin business-scoped adapter over existing Fleet measurement/projection primitives. The historical audit remains unchanged as a point-in-time record.

## Implemented boundary

The Fleet configuration layer provides business-scoped metric definitions and assignments covering metric identity, source dataset/metric, aggregation, direction, goal/threshold, scoring method/configuration, period, activation state, and target scope.

The architecture remains:

```text
Fleet operational facts
        ↓
Existing/shared measurement primitives
        ↑
Fleet business configuration adapter
        ↓
Fleet controller/performance views
```

`Observe` ≠ `Configure` ≠ `Operate`.

## Authorization

Controller mutations require an authenticated actor who is an owner/admin/manager of the business and has Fleet access. The controller functions use trusted `SECURITY DEFINER` search paths and are not anonymous capabilities.

The browser does not establish business ownership; the capability resolves authorization from authenticated identity plus canonical business membership/access.

## Implementation evidence

The repository history now contains the Fleet controller metric adapter, validation/bounds hardening, configuration-service migration, capability-catalog wiring, runtime synchronization, and Fleet operations UI wiring for controller metrics/performance leaderboard presentation.

## Verification gate

This resolves the architecture/model gap. It does **not** by itself claim Production deployment. The intended migration set must still be applied/verified in the target Supabase environment and the create/update/assign/read paths exercised with both an authorized controller and a denied non-controller.

## Guardrails

- Do not create a second telemetry/measurement engine.
- Do not let controller configuration mutate operational facts.
- Do not repurpose `feature_catalog.configuration` or progression `metrics_config` as Fleet controller configuration.
- Do not expose worker/materialization primitives as browser capabilities without a verified caller contract.
