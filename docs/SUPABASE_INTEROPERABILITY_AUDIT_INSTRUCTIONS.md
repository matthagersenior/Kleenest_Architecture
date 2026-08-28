# Supabase Interoperability Audit Instructions

## Purpose

Kleenest's definition of a completed capability is end-to-end: database/RPC or Edge Function -> service/contract -> entitlement -> route/navigation -> rendered control -> user action -> persisted/observable outcome.

No backend object, capability registry entry, dashboard card, button, or control is considered implemented merely because it exists. It must be reachable and functional through the UI appropriate to its workspace and membership tier.

## Current production baseline

Production project: `Kleenest Production` (`ssgesjzdvdsqacdtasje`). It is currently ACTIVE_HEALTHY on PostgreSQL 17.6.1.

The live Edge Function inventory must be treated as authoritative during audits. The current inventory includes multiple versioned families that require explicit interoperability review before further expansion, including:

- `public-data-ingest`, `public-data-ingest-v2`, `public-data-ingest-v3`, `public-data-ingest-v4`
- `market-bathroom-ingest`, `market-bathroom-ingest-v2`, `market-bathroom-ingest-v3`, `market-bathroom-ingest-v4`, `market-bathroom-ingest-v5`
- `ingest-map-candidates`, `ingest-map-candidates-v2`, `ingest-map-candidates-v3`
- `admin-tools` and `admin-user-control`
- `generate-intelligence-notifications` and `deliver-intelligence-notification`
- `stripe-create-checkout`, `stripe-billing-webhook`, `stripe-customer-portal`
- `run-reporting-schedules`
- `maps-ingest`, `network-source-ingest`, `datagov-network-ingest-v1`, `public-data-catalog`, and `backfill-location-addresses`

Versioned names are not automatically duplicates. Each must be classified by responsibility, input/output contract, data tables touched, caller, authentication mode, deployment status, and whether an older version is still reachable from the UI, scheduler, trigger, RPC, or another function.

## Required audit sequence

### 1. Inventory

For every connected Supabase project:

1. Enumerate tables, views, functions/RPCs, triggers, Edge Functions, scheduled jobs, storage buckets, auth dependencies, and relevant extensions.
2. Enumerate function versions and configuration, especially `verify_jwt`, entrypoint, import map, and deployment status.
3. Record the last update/deployment information where available.
4. Compare production against repository source/configuration.

### 2. Capability classification

Classify every meaningful backend operation as one of:

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

### 3. Interoperability matrix

Create or update an interoperability matrix whenever an audit uncovers any deeper inconsistency, conflict, duplicate, competing implementation, or unclear ownership.

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

Status must be one of `WIRED`, `PARTIAL`, `CONFLICT`, `DUPLICATE`, `ORPHANED`, `DEPRECATED`, or `UNKNOWN`.

### 4. UI reconciliation

For every capability marked canonical:

- Confirm there is a real route.
- Confirm the route renders the intended dashboard/control center/page.
- Confirm the relevant navigation item appears in the correct workspace.
- Confirm every button has a real handler or route.
- Confirm route parameters/preview identifiers use canonical vocabulary.
- Confirm locked capabilities are intentionally locked rather than accidentally broken.
- Confirm the button action reaches the intended service/RPC/Edge Function.
- Confirm the result is visible to the user or produces an observable state change.
- Confirm errors are surfaced rather than silently swallowed.

Pay particular attention to Owner membership preview, Quick Finds, Owner/Admin control centers, Business/Fleet/Enterprise dashboards, Capability Hub, Operational Capabilities, Reporting, Intelligence, QR, Maps, Notifications, and CRUD workbenches.

### 5. Membership reconciliation

For every membership tier represented in the product model and Supabase feature catalog:

1. Verify canonical tier identifier.
2. Verify enabled feature catalog entries.
3. Verify workspace exposure.
4. Verify frontend entitlement checks.
5. Verify backend/RPC authorization.
6. Verify preview navigation uses the canonical preview key.
7. Verify every visible Premium/Family/Fleet/Enterprise/Business control works in preview mode.

A button that renders but opens the wrong workspace is a failed capability.

### 6. Edge Function interoperability

Every Edge Function must be mapped to its caller and authentication mode.

Supabase currently documents these patterns:

- User calls: user JWT + `verify_jwt=true`.
- Service-to-service calls using secret keys: `verify_jwt=false` with explicit secret-key authentication.
- Publishable-key calls: `verify_jwt=false` with explicit publishable-key authentication.
- Public endpoints/webhooks: `verify_jwt=false`, with authentication performed in the handler when required.

Do not change authentication flags merely to make a UI button work. First identify the caller contract and then align both sides. Supabase's current guidance confirms that publishable/secret keys are not JWTs and should not be sent as bearer JWTs. See the current Supabase authorization and security documentation before modifying auth behavior.

### 7. Duplicate/version-family audit

For versioned families, determine:

- Which version is canonical.
- Which versions are reachable.
- Which versions are called by UI/service code.
- Which versions are called by cron/scheduler/other functions.
- Whether schemas or payload contracts differ.
- Whether they write to the same tables.
- Whether one version supersedes another.
- Whether older versions can safely be deprecated.

Do not delete or disable a version until all callers have been identified and migrated.

### 8. Deeper conflict rule

If the audit uncovers a deeper inconsistency—such as two functions claiming the same capability, different RPC contracts for the same UI action, mismatched tier rules, duplicate ingestion pipelines, conflicting ownership, or divergent data models—STOP treating the affected area as a normal implementation slice.

First create/update the interoperability matrix, identify the canonical contract, document the conflict, and only then implement the migration/fix.

## Acceptance criteria

An audit is complete only when:

- Every canonical capability has a UI entry point.
- Every UI entry point has a working route/control.
- Every control reaches the intended service/backend contract.
- Every backend dependency is classified.
- Every membership restriction agrees between UI and backend.
- Every active Edge Function has a known caller and auth contract.
- Versioned/duplicate families have an explicit canonical owner.
- New conflicts have an interoperability matrix.
- No stale UI surface is presented as a live capability.
- No backend capability is claimed as implemented without UI verification.

## Future implementation rule

Before adding a new capability:

1. Search the repository and Supabase for an existing capability/function/RPC/Edge Function with the same responsibility.
2. Reuse the canonical implementation if one exists.
3. If multiple implementations exist, audit and matrix them before adding anything.
4. Add backend support and UI wiring together.
5. Add entitlement/tier exposure together.
6. Verify the complete interaction path.
7. Record the implementation and verification in the project progress log.

This document is an operating instruction for future Kleenest development, not optional documentation.
