# Consumer Parity Matrix — Batch 1

Status values:

- **GREEN** — a named consumer exists in `Kleenest_App` and the capability is represented by the current architecture.
- **YELLOW** — consumer/backend evidence exists but completeness still needs verification.
- **ORANGE** — UI/service evidence exists but the backend contract or canonical ownership needs verification.
- **RED** — no verified consumer found yet.
- **BLUE** — capability is backend/platform infrastructure and should not be forced into a consumer surface.

This is deliberately conservative. A file existing is not proof that its complete capability is wired correctly.

| Capability | Production authority | Existing Kleenest_App evidence | Status | Architecture destination |
|---|---|---|---|---|
| Supabase client | Supabase project | `src/lib/supabase.js` | GREEN | `infrastructure/supabase` |
| Authentication | Auth + `profiles` | `src/services/auth.js`, `src/context/AuthContext.jsx` | YELLOW | `domains/identity` |
| Profiles | `profiles` | `src/services/profile.js` | YELLOW | `domains/identity` |
| Follows | `follows` | `src/services/follows.js` | YELLOW | `domains/social` |
| Favorites | `favorites`, `location_favorites` | `src/services/favorites.js` | YELLOW | `domains/favorites` |
| Reviews | `reviews`, `review_photos`, `review_likes` | review-related runtime/docs | YELLOW | `domains/reviews` |
| Check-ins | `check_ins`, `location_visits` | `src/services/checkins.js` / check-in runtime evidence | YELLOW | `domains/checkins` |
| QR | `qr_codes`, attribution/redemptions | `src/services/qr.js` | YELLOW | `domains/qr` |
| Rewards | `point_transactions`, `reward_transactions` | `src/services/rewards.js` | YELLOW | `domains/rewards` |
| Reputation | `contributor_reputation`, milestones | `src/services/reputation.js` | YELLOW | `domains/contributors` |
| Milestones | `contributor_milestones` | `src/services/milestones.js` | YELLOW | `domains/progression` |
| Contests | `contests`, `contest_entries` | `src/services/contests.js` | YELLOW | `domains/contests` |
| Social | social post/activity tables | `src/pages/SocialPage.jsx`, social services | YELLOW | `domains/social` |
| Maps/network | locations + map discovery/network data | `src/services/mapNetwork.js` | YELLOW | `domains/maps` |
| Live network | `live_network_events` | `src/services/liveNetwork.js` | YELLOW | `domains/live-network` |
| Admin data | admin capability tables/functions | `src/services/adminData.js` | YELLOW | `domains/admin` |
| Intelligence | intelligence jobs/actions/notifications | intelligence runtime docs and services | YELLOW | `domains/intelligence` |
| Notifications | notification tables/functions | notification runtime docs | YELLOW | `domains/notifications` |
| Business | business tables | business page/service evidence | YELLOW | `domains/business` |
| Enterprise | enterprise tables | backend capability present; consumer needs audit | RED | `domains/enterprise` |
| Fleet | fleet tables | fleet runtime/intelligence evidence | YELLOW | `domains/fleet` |
| Routing | route plans/stops/events + discovery | architecture/docs evidence | YELLOW | `domains/routing` |
| Offline maps | offline pack tables | backend capability present | RED | `domains/offline` |
| Location ingestion | sources/jobs/external records + Edge Functions | map/data ingestion services/functions | YELLOW | `domains/locations/ingestion` |
| Location quality | confidence/observations/verifications | quality/reputation services | YELLOW | `domains/location-quality` |
| Messaging | `messages` | backend table; direct consumer needs audit | RED | `domains/messaging` |
| Family | family tables | backend capability; consumer needs audit | RED | `domains/family` |
| Partner programs | partner/preferred tables | backend capability; consumer needs audit | RED | `domains/partners` |
| Analytics | analytics/data feature events | activity/intelligence evidence | YELLOW | `domains/analytics` |
| Support | feedback/support requests | backend capability | RED | `domains/support` |

## Existing consumer evidence

The reference repository already has explicit service modules for Supabase, QR, auth, follows, profile, rewards, contests, favorites, reputation, milestones, map network, live network, and admin data. It also has canonical/runtime files including `CanonicalAppRuntime.jsx` and `CanonicalConsumerRuntime.jsx`, plus domain, pages, services, context, and infrastructure folders.

These are **references to behavior and ownership**, not a mandate to copy the existing file layout. The Architecture repo will collapse overlapping services into canonical domain capabilities.

## Batch-1 decisions

1. Preserve the proven capability names where they map cleanly to Production.
2. Merge duplicate location concepts into a single `locations` domain with sub-capabilities for discovery, quality, verification, and ingestion.
3. Treat maps and routing as first-class domains, not page-level utilities.
4. Treat entitlements as a cross-cutting capability required by protected product actions.
5. Treat Edge Functions as backend authorities where their security boundary requires them; do not duplicate their logic in the browser.
6. Do not label a capability GREEN merely because a similarly named file exists.

## Next audit batch

Inspect the actual implementation of the existing consumer services and the relevant page actions in grouped batches:

- Batch A: identity/auth/entitlements
- Batch B: locations/maps/routing/quality
- Batch C: check-ins/reviews/favorites/QR
- Batch D: social/messaging/family
- Batch E: rewards/progression/contests/reputation
- Batch F: business/partners
- Batch G: enterprise/fleet
- Batch H: intelligence/notifications/analytics/admin/support
