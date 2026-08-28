# Kleenest Interoperability 3D Map

This model treats every surface as a point in a three-dimensional system rather than as an isolated page.

## Axis 1 — Product hierarchy

`Surface → Capability → Command → Read model → Downstream effect`

## Axis 2 — Experience/workspace

`Consumer | Business | Fleet | Enterprise | Owner | Admin`

## Axis 3 — Lifecycle/operability

`UI → Access → Data → Mutation → Event → Intelligence → Notification → Offline/Realtime → Audit`

A capability is complete only when its path through all three axes is coherent.

## Canonical 3D coordinate

`(workspace, capability, lifecycle stage)`

Examples:

- `(consumer, check-in, mutation)`
- `(consumer, check-in, event)`
- `(business, engagement, intelligence)`
- `(fleet, service-event, audit)`
- `(enterprise, campaign, attribution)`
- `(admin, permissions, access)`

## Cross-surface spine

```text
                           ┌───────────────────────┐
                           │       PLATFORM        │
                           │ policy / permissions  │
                           │ provenance / audit    │
                           └───────────┬───────────┘
                                       │
       ┌───────────────────────────────┼───────────────────────────────┐
       │                               │                               │
       ▼                               ▼                               ▼
 ┌────────────┐                  ┌────────────┐                  ┌────────────┐
 │  CONSUMER  │                  │  BUSINESS  │                  │   FLEET    │
 │ discover   │                  │ locations  │                  │ routes     │
 │ place      │                  │ engagement │                  │ stops      │
 │ contribute │                  │ analytics  │                  │ service    │
 └─────┬──────┘                  └─────┬──────┘                  └─────┬──────┘
       │                               │                               │
       └──────────────────────┬────────┴────────┬──────────────────────┘
                              ▼                 ▼
                       ┌────────────┐    ┌────────────┐
                       │ ENTERPRISE │    │   OWNER    │
                       │ network    │    │ command    │
                       │ programs   │    │ intelligence│
                       └─────┬──────┘    └─────┬──────┘
                             └─────────┬───────┘
                                       ▼
                                ┌────────────┐
                                │   ADMIN    │
                                │ governance │
                                │ audit      │
                                └────────────┘
```

## Matrix

| Surface/workspace | Discover/UI | Access | Canonical data | Commands | Events/effects | Intelligence | Notifications | Offline/realtime | Audit/provenance |
|---|---|---|---|---|---|---|---|---|---|
| Consumer | map/place/action center | auth + membership | places/check-ins/reviews | check-in/observe/review | progression/reputation/activity | consumer intelligence | actionable contribution/status | queue + convergence | contribution evidence |
| Business | dashboard/locations/engage | business membership/ownership | locations/assets/engagement | QR/campaign/event/promotion/review reply | attribution/redemption | business intelligence | owner alerts/CTAs | operational convergence | business audit trail |
| Fleet | command/routes/stops | fleet authorization | routes/stops/service state | dispatch/service/update | measurement/scorecard | fleet intelligence | operational alerts | queue/replay/realtime | service evidence |
| Enterprise | command/network/programs | enterprise authorization | partners/programs/outcomes | allocation/campaign/network actions | attribution/ROI | network intelligence | decision CTAs | convergence | enterprise provenance |
| Owner | command/capabilities/intelligence | owner authorization | cross-domain read models | governance/operational actions | cross-surface refresh | owner intelligence | owner notifications | convergence | owner audit |
| Admin | governance/capabilities/audit | admin authorization | platform control state | permissions/configuration | platform-wide effects | platform intelligence | security/maintenance alerts | convergence | immutable governance evidence |

## Completion rule

A matrix cell is not `complete` merely because a UI exists. It requires evidence for every applicable lifecycle layer. Status vocabulary:

- `NOT_IMPLEMENTED`
- `PARTIAL`
- `IMPLEMENTED`
- `INTEGRATED`
- `VERIFIED`
- `REGRESSION_RISK`

## Slice rule

Large implementation slices should occupy a contiguous region of this 3D model. A slice must repair all affected coordinates, not only the initiating surface.
