# Supabase Interoperability Audit Instructions

## Purpose

Kleenest's definition of a completed capability is end-to-end: database/RPC or Edge Function -> service/contract -> entitlement -> route/navigation -> rendered control -> user action -> persisted/observable outcome.

**An audit is an implementation task, not a report-only task. Every actionable finding must be fixed, removed, deprecated, or explicitly resolved before the audited area is considered complete.**

No backend object, capability registry entry, dashboard card, button, control, schema, RPC, Edge Function, or service is considered implemented merely because it exists. It must be reachable, functional, and produce a real observable result through the appropriate UI, workspace, and membership tier.

## Non-negotiable completion rules

1. **No gaps:** Every claimed capability must have a complete verified path from UI to result.
2. **No placeholders:** No visible placeholder, mock control, dead link, fake success, empty implementation, or "coming soon" surface may be counted as complete.
3. **No schema without results:** A table, RPC, Edge Function, registry entry, or service contract is not completion unless its intended consumer can use it and observe the intended result.
4. **Findings must be fixed:** Do not merely log defects. Repair the UI, service, entitlement, backend contract, data path, authentication, or architecture as required.
5. **Re-test after fixes:** A finding remains open until the repaired interaction is verified end-to-end.
6. **Deeper conflicts trigger matrices:** Any duplicate, conflicting contract, version family, naming drift, ownership ambiguity, divergent tier rule, or competing implementation requires an interoperability matrix before continuing normal feature expansion.
7. **Do not hide failures:** Errors must surface to the user/operator and be actionable; silent catches that make a control appear successful are failures.
8. **Do not manufacture coverage:** Unclassified backend functions are investigation targets, not automatically product capabilities.

## Required audit sequence

### 1. Inventory every connected Supabase project

For every connected Supabase project:

- Enumerate tables, views, functions/RPCs, triggers, Edge Functions, scheduled jobs, storage buckets, auth dependencies, and relevant extensions.
- Enumerate Edge Function versions/configuration, especially `verify_jwt`, entrypoint, imports, deployment status, and callers.
- Record update/deployment information where available.
- Compare live production configuration against repository source/configuration.
- Identify objects that exist without a consumer, result, owner, or documented lifecycle.

### 2. Classify backend operations

Classify every meaningful backend operation as:

- canonical user capability
- supporting backend operation
- internal orchestration
- ingestion/import pipeline
- scheduled/background operation
- webhook
- migration/maintenance operation
- deprecated/legacy candidate
- duplicate/conflicting implementation
- unknown/unclassified

Do not expose raw supporting RPCs as product capabilities unless a real user-facing contract exists.

### 3. Build/update interoperability matrices

Create or update an interoperability matrix whenever an audit uncovers any deeper inconsistency, conflict, duplicate, competing implementation, version family, naming drift, unclear ownership, divergent data model, or mismatched UI/backend/tier contract.

Each matrix row must include:

| Field | Required |
|---|---|
| Capability | Yes |
| Domain | Yes |
| UI surface(s) | Yes |
| Route(s) | Yes |
| Membership/tier requirements | Yes |
| Frontend service | Yes |
| RPC/table dependency | Yes |
| Edge Function dependency | If applicable |
| Caller(s) | Yes |
| Authentication mode | Yes |
| Data written | Yes |
| Data read | Yes |
| Output/event contract | Yes |
| Competing implementations | If applicable |
| Duplicate/version family | If applicable |
| Conflict | If applicable |
| Canonical implementation | Yes |
| Migration/deprecation action | If applicable |
| UI verification status | Yes |
| Backend verification status | Yes |
| Interoperability status | Yes |
| Finding/fix status | Yes |
| Verification evidence | Yes |

Status must be one of `WIRED`, `PARTIAL`, `CONFLICT`, `DUPLICATE`, `ORPHANED`, `DEPRECATED`, or `UNKNOWN`.

**A matrix is not complete documentation until every actionable row has a corresponding fix/migration/deprecation and verification evidence.**

### 4. UI reconciliation and repair

For every canonical capability:

- Confirm a real route exists.
- Confirm the route renders the intended dashboard/control center/page.
- Confirm navigation appears in the correct workspace.
- Confirm every button has a real handler or route.
- Confirm route parameters and preview identifiers use canonical vocabulary.
- Confirm locked capabilities are intentionally locked rather than accidentally broken.
- Confirm each button reaches the intended service/RPC/Edge Function.
- Confirm the action produces the intended visible, persisted, emitted, or otherwise observable result.
- Confirm errors are surfaced.
- **Fix every failure discovered during this process before declaring the audit complete.**

Priority surfaces include Owner membership preview, Quick Finds, Owner/Admin control centers, Business/Fleet/Enterprise dashboards, Capability Hub, Operational Capabilities, Reporting, Intelligence, QR, Maps, Notifications, and CRUD workbenches.

### 5. Membership reconciliation and repair

For every membership tier represented in the product model and Supabase feature catalog:

1. Verify canonical tier identifier.
2. Verify enabled feature catalog entries.
3. Verify workspace exposure.
4. Verify frontend entitlement checks.
5. Verify backend/RPC authorization.
6. Verify preview navigation uses the canonical preview key.
7. Verify every visible Premium/Family/Fleet/Enterprise/Business control works in preview mode.
8. Fix every mismatch found and retest the complete path.

A button that renders but opens the wrong workspace is a failed capability.

### 6. Edge Function interoperability and repair

Every Edge Function must be mapped to its caller and authentication mode.

Supabase patterns include:

- User calls: user JWT + `verify_jwt=true`.
- Service-to-service calls using secret keys: `verify_jwt=false` with explicit secret-key authentication.
- Publishable-key calls: `verify_jwt=false` with explicit publishable-key authentication.
- Public endpoints/webhooks: `verify_jwt=false`, with handler-level authentication when required.

Do not change authentication flags merely to make a UI button work. Identify the caller contract, align both sides, fix the finding, and retest.

### 7. Duplicate/version-family audit and resolution

For every versioned family determine:

- canonical version
- reachable versions
- UI/service callers
- scheduler/cron callers
- Edge Function callers
- RPC/table callers
- payload/schema differences
- authentication differences
- data writes/reads
- whether one supersedes another
- whether old versions can safely be deprecated

Do not delete or disable a version until all callers are identified and migrated. Once the canonical implementation is established, **perform the migration/deprecation cleanup** and verify that no stale caller remains.

### 8. Schema/result verification

For every schema object introduced or relied upon:

- Identify its intended consumer.
- Identify the exact UI/service operation that exercises it.
- Execute the operation.
- Verify meaningful data/result/state is produced.
- Verify the result is consumed by the UI/operator where appropriate.
- Verify authorization and RLS behavior.
- Fix empty-result, orphaned-schema, permission, naming, or contract issues discovered.

A schema with no verified result path is an audit finding, not a completed capability.

### 9. Deeper conflict rule

If an audit uncovers a deeper inconsistency—two functions claiming the same capability, different RPC contracts for the same UI action, mismatched tier rules, duplicate ingestion pipelines, conflicting ownership, divergent data models, or incompatible Edge Function versions—**stop normal implementation in that area**.

Create/update the interoperability matrix, establish the canonical contract, implement the required migration/fix, remove or deprecate the conflicting path where safe, and verify the repaired system before proceeding.

## Finding lifecycle

Every finding must move through:

`DISCOVERED -> CLASSIFIED -> MATRIXED (if needed) -> FIXED/MIGRATED/DEPRECATED -> RETESTED -> VERIFIED -> CLOSED`

A finding may not be marked closed because code was written. It closes only after the actual user/operator interaction and backend result are verified.

## Acceptance criteria

An audit is complete only when:

- Every canonical capability has a UI entry point.
- Every UI entry point has a working route/control.
- Every control reaches the intended service/backend contract.
- Every backend dependency is classified.
- Every membership restriction agrees between UI and backend.
- Every active Edge Function has a known caller and auth contract.
- Versioned/duplicate families have an explicit canonical owner and cleanup plan executed where applicable.
- New conflicts have an interoperability matrix.
- Every actionable finding has been fixed, migrated, deprecated, or explicitly resolved.
- Every fix has been retested end-to-end.
- No stale UI surface is presented as a live capability.
- No backend capability is claimed as implemented without UI verification.
- No schema/RPC/function is counted as complete without a verified meaningful result path.
- No placeholders or fake controls remain in the audited area.
- No known gaps remain in the audited capability path.

## Future implementation rule

Before adding a new capability:

1. Search the repository and **all connected Supabase projects** for an existing capability/function/RPC/Edge Function with the same responsibility.
2. Reuse the canonical implementation if one exists.
3. If multiple implementations exist, audit and matrix them before adding anything.
4. Add backend support and UI wiring together.
5. Add entitlement/tier exposure together.
6. Verify the complete interaction path and observable result.
7. Fix every finding uncovered by verification.
8. Record the implementation, matrix changes, fixes, and verification evidence in the project progress log.

This document is an operating instruction for future Kleenest development, not optional documentation.