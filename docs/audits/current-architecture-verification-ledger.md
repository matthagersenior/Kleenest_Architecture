# Current Architecture & Verification Ledger

Date: 2026-08-28
Branch: `runtime-workspace-stabilization`

## Purpose

Current-state companion to historical architecture audits. Historical audit files remain immutable evidence of their original state. This ledger records current implementation, current verification, active interoperability findings, and the governing large-slice order.

## Current canonical boundaries

| Area | Current boundary | Status |
|---|---|---|
| Application runtime | `CanonicalAppRuntime` + five route modules | IMPLEMENTED |
| Workspace model/access | definitions + membership/access model | IMPLEMENTED |
| Workspace navigation | navigation data + model + presentation/config + React shell | IMPLEMENTED |
| Capability authority | registry + contract + shared presentation adapter | IMPLEMENTED |
| Owner membership preview | decomposed preview surface + canonical product model | IMPLEMENTED |
| Intelligence | action + convergence + notification + owner services | IMPLEMENTED |
| UI interaction audit | JSX-aware boundary | IMPLEMENTED |
| Current interoperability audit | route/workspace/capability destination gate | IMPLEMENTED / NEW |

## Latest verified CI baseline

The latest complete GitHub Actions baseline before this new audit layer completed successfully through:

- canonical architecture audit;
- canonical route contract;
- production configuration;
- production build;
- correct Kleenest React artifact verification.

The latest successful run was `33152594483` (run 1475). The branch's new interoperability-audit commits have not yet received a fresh workflow result, so they are **NOT VERIFIED** until CI executes them.

## New current audit

`2026-08-28-current-interoperability-audit.md` is the authoritative current-state interoperability audit for this stabilization phase.

`2026-08-28-interoperability-matrix.md` is the current dependency/authority matrix used to order large implementation slices.

The new automated gate is `npm run audit:interoperability`, backed by `scripts/current-interoperability-audit.mjs`.

It checks:

- capability destination → canonical route;
- workspace-contextual capability destination → canonical route;
- workspace navigation destination → canonical route;
- capability registry → presentation coverage;
- presence of the decomposed runtime/workspace/capability boundaries.

## Important current finding

The earlier global capability destination map contained stale/nonexistent `/reporting` routing and privileged/generic destinations that were not appropriate for business/fleet/enterprise contexts. Capability destinations are now workspace-aware. This is a product/navigation correctness issue, not merely an audit issue.

## Monolith assessment

### CanonicalAppRuntime.jsx

**Do not decompose further.** It is already a thin composition root. Further fragmentation would increase indirection without reducing state or responsibility.

### WorkspaceShell.jsx

**Hold further decomposition.** Preview, access, navigation, and workspace presentation are already extracted. Re-splitting the coordinator before the next audit would create unnecessary indirection. Revisit only if new mutable workflow state enters the shell.

### Next candidate

`OwnerIntelligenceLab.jsx` is currently a dense candidate for measured decomposition because scope selection, canonical service dispatch, action execution, event-driven refresh, result presentation, and navigation are combined in one component. Treat this as one owner-intelligence UI slice after the interoperability gate passes.

## Governing large-slice order

1. **Interoperability foundation** — destination authority, workspace context, capability presentation, navigation, membership/preview consistency.
2. **Consumer evidence loop** — location → canonical check-in → evidence/review → progression/reputation → intelligence → notification.
3. **Progression/trust engagement** — rewards/quests/contests/verification with duplicate-effect protection.
4. **Business growth loop** — location/assets → QR/campaign/event → engagement/redemption → analytics/intelligence → action/outcome.
5. **Fleet operations** — route → stop → service event → measurement → scorecard → intelligence.
6. **Enterprise network** — partner → campaign/allocation → outcome → ROI/intelligence.
7. **Owner Platform CRUD/governance** — privileged read/write workflows and auditability.
8. **Admin/intelligence/notifications/reporting** — derived read/action/delivery convergence.
9. **Offline/realtime interoperability** — replay against canonical commands and event/read-model convergence.
10. **Retirement + visual QA + E2E** — duplicate path removal, responsive/mobile flow verification, full coverage, production gate.

## Acceptance rule

A large slice is complete only when its full chain is accounted for:

`UI entry → workspace access → canonical read → authoritative command → server effects → events/read model → notification/CTA → offline/replay if applicable → audit → production build`

A route, card, RPC wrapper, or page by itself is never sufficient evidence of completion.

## Reclamation rule

The runtime/workspace stabilization reclamation point remains protected. No change may remove it until the complete audit/build chain is green after the current interoperability layer is incorporated.
