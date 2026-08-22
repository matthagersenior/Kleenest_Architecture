# Kleenest Feature Parity Matrix

| Capability family | Canonical UI target | Backend path | Status rule |
|---|---|---|---|
| Location discovery | Home / Map / Discover | locations + discovery RPCs | End-to-end |
| Location evidence | Place details / contribution panels | visit, observation, quality, amenity, restroom RPCs | End-to-end |
| Photos | Place details / contribution | storage + photo submission | End-to-end |
| Verification | Place details / check-in | verification/check-in RPCs | End-to-end |
| Favorites | Place details / saved surfaces | favorite RPCs | End-to-end |
| Routing | Map / Route Planner | route creation, stops, events, completion | End-to-end |
| Offline | Map / contribution runtime | discovery/cache + queued writes | End-to-end |
| Live network | Home / Map / Notifications | publish, geofence, intelligence, read-state | End-to-end |
| Gamification | Rewards / Games / Contests / Leaderboard | progression, points, streaks, achievements, rewards | End-to-end |
| Business | Business dashboard and sub-pages | locations, reviews, campaigns, promotions, analytics, occupancy | End-to-end |
| Enterprise | Enterprise command surface | networks, partners, usage, outcomes, benchmarking | End-to-end |
| Fleet | Fleet operations | opportunities, route notifications, location intelligence | End-to-end |
| Admin | Admin data / CRUD / integrity | management, moderation, feature controls | End-to-end |
| QR | QR scanner / check-in | QR campaigns, check-in, analytics | End-to-end |
| Commerce | Stripe boundary | Stripe products/prices/payments | End-to-end when introduced |

## Completion definition
A row is complete only when the canonical UI has a real user action, the action reaches the authoritative service/RPC, identity and entitlement rules are enforced, success/error state is visible, and CI/build verification passes.

## Collision prevention
- One canonical runtime.
- One route per feature intent.
- One service per domain capability.
- No legacy UI imported into canonical runtime.
- No duplicate Supabase clients.
- No capability marked complete from backend inventory alone.
