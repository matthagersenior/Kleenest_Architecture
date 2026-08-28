# Kleenest Current Interoperability Audit — 2026-08-28

## Scope

This is a current-state audit of the architecture after the runtime/workspace stabilization and capability-presentation refactors. It supersedes neither historical audit. Historical documents remain evidence of their original findings.

## Executive finding

The runtime composition is now appropriately decomposed: `CanonicalAppRuntime` is a route composer and `WorkspaceShell` delegates preview/access/presentation concerns. The capability layer has also been consolidated behind `capabilityPresentation.js`.

The new audit identifies a remaining interoperability class: **destination authority and workspace context are not yet fully canonicalized**. Capability presentation previously contained global destinations that could point a business/fleet/enterprise user at a consumer or owner surface. The implementation slice beginning with this audit makes destinations workspace-aware and adds an automated route-destination gate.

## Verified architectural observations

### Runtime

`CanonicalAppRuntime.jsx` contains only route composition and delegates route ownership to five route modules. This is stable and should not be decomposed further unless route loading/performance requires it.

### Workspace shell

`WorkspaceShell.jsx` coordinates loading, owner status, preview state, access resolution, workspace switching, navigation, monetization presentation, and the tier hero. Preview/access/presentation are already extracted. It remains a coordinator, not a monolith that should be split indiscriminately.

### Navigation

Workspace navigation is separated into workspace definitions, navigation data, navigation model, configuration/icons, and the React navigation component. This is the correct decomposition direction. The remaining concern is semantic duplication between capability destinations and workspace navigation destinations.

### Capability presentation

`capabilityPresentation.js` is the current canonical presentation adapter between the capability registry, workspace exposure, runtime services, live catalog, backend contracts, labels, status, and UI destinations.

## Current interoperability findings

| Contract | Current state | Severity | Required action |
|---|---|---:|---|
| Canonical capability identity | Central registry | Low | Preserve |
| Capability presentation | Central adapter | Low | Preserve/expand |
| Capability destination → actual route | Previously partial | High | Automated route-destination audit |
| Capability destination → workspace context | Previously global | High | Workspace-aware destinations |
| Workspace navigation → actual route | Central data/model | Medium | Audit continuously |
| Membership → workspace access | Central contract | Medium | Reconcile against capability exposure |
| Preview → workspace | Central preview map | Medium | Include in interoperability audit |
| Runtime route composition | Decomposed | Low | Preserve |
| Owner authorization | Route-level guard | Medium | Continue full CI verification |
| Intelligence service graph | Split by responsibility | Medium | Verify against current service names/contracts |
| UI labels/status | Shared capability model | Low | Preserve |

## Destination findings

The earlier capability presentation map contained destinations that were no longer represented by canonical routes (`/reporting` was the clearest example) and sent some workspace-specific capabilities to generic or privileged destinations. The new contextual destination map routes reporting/analytics/intelligence/review/external-data surfaces through the workspace that actually owns the UI.

The new `current-interoperability-audit.mjs` verifies:

- capability destinations resolve to canonical route modules;
- contextual capability destinations resolve;
- workspace navigation destinations resolve;
- every capability registry ID has a presentation destination;
- canonical runtime/workspace/capability presentation files remain present.

## Monolith assessment

### `CanonicalAppRuntime.jsx`

**Do not split further.** It is already a thin composition root. Splitting it more would create indirection without reducing state or responsibility.

### `WorkspaceShell.jsx`

**Do not perform another broad split yet.** Its major stateful concerns have already been extracted into `useWorkspacePreview`, `useWorkspaceAccess`, and workspace presentation/navigation modules. A future extraction is justified only if the coordinator gains additional mutable workflows.

### Next likely monolith candidates

The current audit flags dense owner/intelligence surfaces as candidates for measured decomposition. `OwnerIntelligenceLab.jsx` is particularly dense: scope selection, service dispatch, action execution, event refresh, result rendering, and navigation are all composed in one file. This should be addressed as a single owner-intelligence UI slice after the current interoperability gate is green, not as unrelated micro-tasks.

## Updated large-slice implementation order

1. **Interoperability foundation** — route destinations, workspace context, capability presentation, navigation, membership/preview consistency.
2. **Consumer evidence loop** — location → check-in → evidence/review → progression/reputation → intelligence → notification.
3. **Business growth loop** — location/assets → QR/campaign/event → engagement/redemption → analytics/intelligence → action/outcome.
4. **Fleet operations** — route → stop → service event → measurement → scorecard → intelligence.
5. **Enterprise network** — partner → campaign/allocation → outcome → ROI/intelligence.
6. **Owner platform** — CRUD/governance/audit/capability control plane.
7. **Admin/intelligence/notifications/analytics** — close derived-read/action/delivery loops.
8. **Offline/realtime** — canonical command replay + event/read-model convergence.
9. **Retirement/QA** — remove duplicate paths, visual QA, end-to-end coverage, production verification.

## Acceptance rule

No product-domain slice is promoted to VERIFIED until the current interoperability audit, all existing architecture audits, and the production build pass together.
