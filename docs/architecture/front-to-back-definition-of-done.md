# Front-to-Back Feature Definition of Done

A Kleenest feature is not complete because a database object, service, route, or button exists. It is complete only when the entire interaction path is wired and validated.

## Required chain

1. Capability exists in the canonical architecture.
2. Canonical data model/RPC exists or an existing capability is reused.
3. Authorization/RLS is correct for the actor and resource.
4. Domain service exposes the operation.
5. App context/container exposes the service.
6. Product navigation exposes the feature.
7. UI exposes a meaningful control/action.
8. The control invokes the domain operation—not a mock, local-only mutation, or placeholder.
9. The backend returns the resulting fact/state.
10. UI reflects success, loading, empty, and failure states.
11. Downstream engagement/analytics/notification is triggered where the architecture requires it.
12. The path is covered by an automated or production-artifact audit.

## Consumer critical loop

Map → Location → Route → Visit/Check-in → QR → Quest/Progression → Reward → Notification.

## Business critical loop

Business location → Health/intelligence → Recommended action → QR/Campaign/Promotion → Consumer engagement → Attribution → ROI.

## Semantic AI rule

Semantic AI may interpret intent, summarize canonical evidence, explain metrics, and recommend next actions. It may not manufacture location facts, cleanliness, accessibility, occupancy, verification, pricing, promotions, rewards, or business claims.

## Release rule

A feature with any missing link in the chain remains `incomplete` even if its underlying backend capability is production-ready.
