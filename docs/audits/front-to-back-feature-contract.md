# Kleenest Front-to-Back Feature Contract

A feature is **not complete** merely because a database table, RPC, service, or page exists. Every canonical capability must terminate in an actionable UI and every UI action must resolve back to an authorized canonical operation and resulting fact.

## Required chain

`capability → data contract → authorization/RLS → service → app context/state → route/screen → visible control → click/tap handler → mutation/query → resulting fact → refresh/state update → telemetry/notification/engagement`

## Completion gates

- **C0 Canonical:** authoritative data/function exists and is documented.
- **C1 Authorization:** correct anonymous/authenticated/business/admin boundary exists; no security weakening.
- **C2 Service:** UI does not duplicate backend rules; it calls the canonical service/RPC.
- **C3 Reachability:** a user can navigate to the feature from the appropriate product surface.
- **C4 Control:** every intended action has a real button/link/gesture with a non-placeholder handler.
- **C5 Mutation/query:** the handler performs the intended canonical operation.
- **C6 Result:** success, empty, loading, and failure states are visible and recoverable.
- **C7 Downstream:** resulting facts feed the next engagement/analytics/notification path where applicable.
- **C8 Test:** production build and journey validation cover the path.

## Current Consumer priority chains

1. `Map → Location → Route → Check-in → QR → Quest → Reward → Notification`
2. `Map → Saved/Favorite → Offline`
3. `Profile → Family → Premium/access`
4. `Semantic AI → canonical discovery → Location → next action`

## Business priority chains

1. `Business → Location → Health → Recommended Action`
2. `Business → QR → Campaign/Promotion → Attribution → ROI`
3. `Business → Media/Reviews/Evidence → Health/Trust`
4. `Business → Intelligence → notification/action → measurable result`

## AI rule
Semantic AI may interpret intent, summarize canonical evidence, rank/suggest, and explain next-best actions. It must not invent authoritative location, cleanliness, accessibility, occupancy, verification, pricing, promotion, or business facts.

## Definition of done

A feature is **FULLY WIRED** only when C0–C8 are satisfied. Placeholder text such as “coming soon”, “next routing layer”, or a button that only navigates without executing the intended operation is a failing C4/C5 state and must remain on the implementation backlog.
