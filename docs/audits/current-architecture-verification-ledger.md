# Current Architecture & Verification Ledger

Date: 2026-08-28
Branch: `runtime-workspace-stabilization`

## Purpose

This document is the current-state companion to the historical Batch AO and 2026-08-24 audits. Historical audit files remain immutable records of what was known at the time. This ledger records what the current branch implements and what the latest CI has actually verified.

## Status vocabulary

- **VERIFIED** — implemented and passed the applicable automated gate on the referenced commit.
- **IMPLEMENTED** — present in the current source, but the latest applicable complete verification has not yet passed.
- **PARTIAL** — some contract stages exist, with known gaps.
- **BLOCKED** — implementation cannot safely proceed until a dependency/authority defect is resolved.
- **SUPERSEDED** — historical expectation replaced by the current canonical boundary.

## Current canonical boundaries

| Area | Current boundary | Status |
|---|---|---|
| Application runtime | `CanonicalAppRuntime` + decomposed route modules | IMPLEMENTED |
| Workspace model | workspace definitions/access/navigation separated from UI composition | IMPLEMENTED |
| Navigation UI | workspace navigation model/config/components | IMPLEMENTED |
| Route registry | canonical route registry + route modules | IMPLEMENTED |
| Intelligence actions | `domains/intelligence/actions.js` | IMPLEMENTED |
| Intelligence convergence | `domains/intelligence/convergence.js` | IMPLEMENTED |
| Intelligence notifications | `domains/notifications/intelligence.js` | IMPLEMENTED |
| Owner intelligence | `domains/intelligence/owner.js` | IMPLEMENTED |
| Owner presentation preview | dedicated preview controller/surface | IMPLEMENTED |
| UI interaction audit | JSX-aware audit boundary | IMPLEMENTED |

## Latest verified CI baseline

The latest complete run available before the current audit/documentation changes verified:

- 107 canonical routes across 5 route modules.
- 9 membership tiers / 31 capability domains.
- membership preview audit passed.
- UI interaction audit passed across 202 source files.
- interaction destination audit passed across 107 destinations.
- intelligence loop audit passed.

The subsequent Owner Labs/architecture gate did not complete the full pipeline. Therefore the branch must not be described as fully production-verified until the complete canonical architecture gate passes again.

## Audit interpretation rules

1. Audits validate canonical responsibilities, not historical file placement.
2. A refactor must not be reverted merely to satisfy an audit that still assumes the old monolith.
3. Generated HTML used by Leaflet is not React JSX and must be audited by its runtime-specific interaction contract.
4. Disabled JSX controls are valid controls when the disabled state is intentional and represented by the component contract.
5. Intelligence action, notification, and convergence responsibilities may be split across modules; the audit follows the service graph.
6. Route discovery must inspect canonical route modules rather than only `CanonicalAppRuntime.jsx`.
7. A passing audit is not equivalent to production verification unless the complete CI chain reaches the production build gate.

## Current blockers / next large slices

### 1. Canonical architecture gate

**Status: BLOCKED / REAUDIT REQUIRED**

The latest intelligence-audit correction passed its targeted responsibility inspection but the complete workflow subsequently stopped at the broader canonical architecture gate. The next slice must reconcile that gate against the current decomposed runtime/workspace/owner boundaries before any product-domain claims are promoted to VERIFIED.

### 2. Owner workspace

**Status: IMPLEMENTED / REAUDIT REQUIRED**

Owner routing and intelligence are present, but Owner Labs verification must be run against the current route/service composition. Platform CRUD remains a first-class UX requirement and must be evaluated as an end-to-end workflow, not merely as route existence.

### 3. Product implementation sequence

After the architecture gate is green, continue in the governing dependency order:

1. Consumer evidence loop.
2. Progression/trust engagement.
3. Business growth loop.
4. Fleet operations.
5. Enterprise network/allocation/outcomes.
6. Owner Platform CRUD/governance.
7. Admin/intelligence/notifications/analytics.
8. Offline/realtime interoperability.
9. Duplicate retirement, visual QA, full coverage verification.

## Historical audit relationship

`batch-ao-full-architecture-audit.md` and the 2026-08-24 interoperability/mass-implementation audits remain historical evidence. Do not rewrite them to make them agree with today's branch. Use this ledger to record current state and link future verification commits.

## Reclamation rule

The runtime/workspace stabilization work retains its pre-refactor reclamation point. No large-slice change should remove that recovery boundary until the complete CI/build verification chain is green.
