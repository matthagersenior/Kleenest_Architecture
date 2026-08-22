# Kleenest Supabase → UI Feature Parity Control Matrix

**Production source:** `matthagersenior/Kleenest_App:main`

**Reference repositories:** read-only/reference. Never promote legacy runtime or duplicate UI into production.

## Canonical ownership

- Application runtime: `CanonicalAppRuntime`
- Map: `CanonicalAppRuntime → MapWorkspace → MapSurface`
- Cross-cutting bridges: `FeatureIntegration`
- Backend authority: Production Supabase
- Authentication authority: Supabase Auth
- Commerce authority: Stripe when commerce is implemented

## Current parity pass

### Locations / evidence

| Supabase capability | Canonical service/UI | Status |
|---|---|---|
| `record_location_visit` | `locationActivity` / LocationEvidencePanel | Wired |
| `record_location_observation` | `locationActivity` / LocationContributionPanel | Wired |
| `record_location_route_event` | `locationActivity` / Place details | Wired |
| `record_favorite_route_event` | `locationActivity` / routing | Wired |
| `submit_location_quality_observation` | `locationIntelligence` / LocationContributionPanel | Wired |
| `submit_amenity_observation` | `locationIntelligence` / LocationContributionPanel | Wired |
| `submit_restroom_observation` | capability contract/service | Backend available; UI contribution path is quality+amenity today |
| `submit_location_photo_record` | photo service / evidence UI | Wired |
| `record_location_verification` | verification bridge | Wired |
| `submit_location_verification` | verification bridge | Wired |
| contributor reputation/milestones | platform capabilities / Rewards | Wired |

### Routing

| Capability | Status |
|---|---|
| `create_route_plan` | Canonical service wired |
| `prepare_route_discovery` | Canonical service wired |
| `complete_route` | Canonical service wired |
| route events | Canonical service wired |
| favorite route events | Canonical service wired |

### Live network / notifications

The canonical Notifications surface already terminates notification loading, realtime subscriptions, mark-read, preferences, browser push registration, and actionable intelligence links. Production RPCs exist for publishing and processing location/intelligence/Fleet notifications.

### Gamification

The August 22 parity pass promoted **challenges and badges from `next` to working UI** in the canonical Rewards surface. Rewards now loads challenge definitions and user progress, exposes challenge completion through `complete_progression_challenge`, loads earned badges, and exposes `evaluate_user_badges`.

### Business

Business performance already exposes lifecycle engagement, growth, ROI, and visitor signals through the canonical Business Performance route.

## Known deliberate boundaries

- Do not add a second map implementation.
- Do not mount legacy Enterprise/feature route trees merely because they contain capabilities; only canonical routes count toward production parity.
- Do not mark a backend capability as complete solely because an RPC exists. A capability is complete only when a canonical UI action reaches the authoritative backend with correct auth/entitlement/identity handling.
- Commerce remains a separate Stripe boundary and is not represented as complete until Stripe-backed UI actions exist.
