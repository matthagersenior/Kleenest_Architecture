# Membership Capability Truth Contract

Updated 2026-08-27.

The membership preview and runtime workspace must use the same product model. A preview is valid only when its tier, workspace, capabilities, and locked capabilities resolve from `src/architecture/productModel.js` and `src/domain/workspaces.js` rather than from a second UI-only entitlement list.

## Canonical tiers

- Free Consumer → consumer
- Premium Consumer → consumer
- Family → consumer
- Fleet User → consumer + fleet
- Enterprise User → consumer + fleet + enterprise
- Business Standard → business
- Business Growth → business + enterprise
- Business Fleet → business + fleet + enterprise
- Business Enterprise → business + fleet + enterprise

## UI state contract

Every membership-sensitive control must resolve to one of:

- **enabled** — capability is included and the current workspace is authorized.
- **locked** — capability is known to exist but is excluded from the current product tier; the UI must explain the upgrade/add-on path rather than presenting a dead button.
- **hidden** — capability is not relevant to the current surface and should not create visual noise.

## Workspace contract

Workspace visibility is governed by `canUseWorkspace()` and the effective capability set. Navigation must never infer access from a label alone.

## Preview contract

Owner preview is presentation-only. It must never mutate membership, entitlements, billing, role, or profile state. The preview must use the same capability model as a real account for navigation and feature-state decisions.

## Acceptance test

For each of the nine tiers, QA must verify:

1. Tier banner/identity is correct.
2. Expected workspace(s) are reachable.
3. Navigation contains only applicable destinations.
4. Included capabilities produce working controls.
5. Locked capabilities produce explanatory upgrade/add-on states.
6. No button invokes an unavailable RPC.
7. Mutations refresh authoritative state.
8. Errors are visible and recoverable.
9. Preview exit returns to the Owner Membership Experience Lab.

This document is the membership-lab acceptance contract and should remain aligned with the product model, capability registry, and interoperability matrix.
