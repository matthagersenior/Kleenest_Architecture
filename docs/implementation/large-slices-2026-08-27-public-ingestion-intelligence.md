# Large-Slice Program — Public Ingestion, Intelligence, Fleet & Membership — 2026-08-27

## Slice B — Universal Public Discovery

### Goal
Make Data.gov and other openly provided spatial/public sources first-class discovery sources without creating a second location model.

### Contract
`catalog → dataset/resource → normalized candidate → external identity → canonical location → provenance/conflict → freshness/confidence → discovery`

### Source adapters
- OpenStreetMap
- Data.gov
- federal/state/local open-data catalogs exposed through stable public APIs

### Non-negotiables
- idempotent external identity
- canonical `locations.id`
- source/dataset/record provenance
- source timestamps/version
- conflict preservation rather than destructive overwrite
- bounded batches
- import-job state and retry
- no direct client writes to protected tables

### Acceptance
A Data.gov record that represents a new physical location creates one canonical location and follows the same map/discovery/business/fleet/enterprise rules as an OSM-created location. An existing physical location is enriched rather than duplicated.

## Slice A.1 — Production Permission Boundary

### Goal
Eliminate false membership locks caused by session, network, RPC and backend errors.

### Contract
`loading → verify → allowed | locked | session | network | backend`

### Acceptance
A genuine entitlement denial is rendered as locked. A transient backend/authentication failure is retryable and is never represented as a membership downgrade.

## Slice C — Evidence Intelligence

### Goal
Turn source provenance, observations, reviews, conflicts, freshness and confidence into explainable location evidence.

### Acceptance
Every surfaced trust/recommendation state can explain source evidence, freshness and confidence and provides a correction/verification path where appropriate.

## Slice D — Intelligence Operating System

### Goal
Converge existing intelligence action links, action execution/completion, jobs, notifications and analytics into workspace-specific operating loops.

### Workspace outputs
- Business: growth opportunities, engagement/ROI actions
- Fleet: maintenance, route, driver and service opportunities
- Enterprise: network allocation, partner and benchmark opportunities
- Owner: platform anomalies, ingestion health, entitlement/governance drift

### Acceptance
Every recommendation has evidence, confidence, authorization, an action type, persisted outcome, telemetry and measurable downstream effect.

## Slice E — Fleet Owner Command

### Goal
Give Fleet users the complete operator loop without exposing Owner/admin controls.

### Required loop
`vehicles → drivers → routes → operations → maintenance → alerts → performance → metrics/goals → intelligence → notifications → outcomes`

### Acceptance
Every Fleet mutation uses its authoritative service/RPC, has explicit success/failure handling, refreshes authoritative state, records telemetry, and exposes the next useful action.

## Slice F — Membership Control Audit

### Goal
Audit every interactive control across every membership-tier presentation.

### Control contract
`label → capability → route → service → backend → entitlement → authorization → success → failure → refresh → telemetry`

### Defects to eliminate
- duplicate actions
- conflicting labels/routes
- dead/no-op buttons
- inaccessible controls
- incorrectly locked controls
- direct protected writes
- inconsistent destructive-action handling
- inconsistent button styles
- controls that succeed without authoritative refresh

## Slice G — Cross-Tier Convergence

### Goal
Verify canonical facts propagate across workspaces without shadow state.

### Examples
`new location → Consumer discovery → Business opportunity → Fleet service opportunity → Enterprise network analytics → Owner governance`

## Slice H — Production Closure

### Gate
All audits + build + Pages artifact verification + representative authenticated workspace tests + source ingestion dry run + permission/error-state checks.

### Definition of done
A slice is not complete until its full chain is traceable and operational in the canonical runtime and Production Supabase.
