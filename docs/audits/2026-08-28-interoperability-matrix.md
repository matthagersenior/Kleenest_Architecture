# Kleenest Interoperability Matrix — 2026-08-28

## Matrix key

- **A** — authoritative/canonical
- **R** — runtime consumer
- **P** — presentation/read model
- **C** — command/mutation boundary
- **E** — event/notification dependency
- **O** — owner/admin control
- **V** — verification required

| Domain | Identity | Entitlement | UI/Nav | Canonical data | Command | Events/derived | Offline/realtime | Current gate |
|---|---|---|---|---|---|---|---|---|
| Identity | A | A/R | R | A | C | E | R | Reaudit |
| Locations | R | R | R | A | C | E/P | R | Reaudit |
| Discovery/Maps | R | R | P | A/R | C | E/P | R | Reaudit |
| Check-ins | R | R | R | A | C | E/P | R/V | High priority |
| Reviews/Evidence | R | R | R | A | C | E/P | R | High priority |
| Progression/Rewards | R | R | R | A | C | E/P | R | High priority |
| Social/Family | R | R | R | A | C | E/P | R | Planned |
| QR/Engagement | R | R | R | A | C | E/P | R | High priority |
| Business | R | A/R | R | A | C | E/P | R | Planned |
| Fleet | R | A/R | R/O | A | C | E/P | R/V | Planned |
| Enterprise | R | A/R | R/O | A | C | E/P | R | Planned |
| Intelligence | R | R | P/O | P | C | A/E | R | Reaudit |
| Notifications | R | R | R | A/P | C | A/E | R | Reaudit |
| Analytics | R | R | P | P | — | A/E | R | Reaudit |
| Reporting | R | R | P | P | C | E | R | Reaudit |
| Owner/Admin | R | A | O | A/P | C | E | R | Reaudit |
| Offline | R | R | R | P | C/replay | E | A/R | Planned |

## High-risk interoperability edges

| Edge | Authority | Risk | Acceptance test |
|---|---|---|---|
| Place → location | Locations | Wrong physical identity | Mutations require canonical `location_id` |
| Check-in → review | Check-ins | Duplicate/invalid evidence | Review requires authoritative visit/check-in |
| Check-in → progression | Progression | Double reward | One authoritative progression effect |
| QR → check-in | QR/check-ins | Two reward authorities | Explicit scan/redemption mode |
| Evidence → bathroom verification | Location quality | Conflicting writers | Field-level writer map + idempotency |
| Contest → progression | Progression | Trigger/client double count | Single reward authority |
| Trusted verification → points | Progression | Direct reward bypass | Reward owner is server-side progression |
| Capability → route | Runtime | Stale/dead navigation | Automated destination audit |
| Capability → workspace | Workspace | Wrong surface/privilege | Contextual destination matrix |
| Membership → workspace | Entitlements | UI/access drift | Same effective capability/access contract |
| Intelligence → action | Intelligence | Derived state becomes source | Action must call canonical command |
| Intelligence → notification | Notifications | Duplicate delivery | Dedupe/cooldown + materialization path |
| Notification → action | Domain command | CTA bypass | CTA lands on authorized canonical mutation |
| Offline → command | Domain command | Shadow truth | Replay same authoritative command |
| Realtime → state | Domain read model | Event treated as source | Reconcile event against canonical read |
| Owner CRUD → domain | Domain owner | Privilege leakage | Owner guard + server authorization |

## UX/navigation rules

1. A capability card must lead to a route owned by the current workspace whenever that workspace has a dedicated surface.
2. Generic integration pages are acceptable fallback destinations only when no workspace-specific UI exists.
3. Privileged `/admin` and `/owner` destinations must never be presented as ordinary business/fleet/enterprise capability destinations.
4. Workspace navigation is grouped by user intent: manage, engage, operate, insights, account, governance/platform.
5. Mobile navigation must preserve the same intent hierarchy without requiring desktop-only hover/disclosure behavior.
6. Preview mode changes presentation/context only and never authorization or account state.
7. A stale capability must be visible as a reconciliation gap rather than silently rendered as implemented.

## Large-slice acceptance gates

Every large slice must satisfy:

`UI entry → workspace access → canonical read → authoritative command → server effects → event/read-model convergence → notification/CTA if applicable → offline replay if applicable → audit → build`

A slice is not complete if only its route or UI exists.
