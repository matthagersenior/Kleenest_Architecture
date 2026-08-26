# Kleenest Two-Product / App-Store Launch Plan

**Date:** 2026-08-26

## Target product architecture

The repository is already a monorepo with a dedicated `apps/consumer-mobile` Expo app plus shared `packages/` and a root Vite/runtime surface. The consumer app is already configured for Expo/EAS with iOS bundle identifier `com.kleenest.app`, Android package `com.kleenest.app`, Expo Router, location and secure storage plugins. The current mobile app is therefore the correct foundation for Product 1.

### Product 1 — Kleenest Consumer

Store-facing promise:

> Find a cleaner, more trustworthy restroom when you need one.

Primary flows:

1. Open map.
2. Get nearby canonical locations.
3. See bathroom status, access, cleanliness, confidence and freshness.
4. Select a restroom.
5. Route/visit/check in.
6. Contribute evidence or review.
7. Earn progression/reputation.
8. Receive useful contextual recommendations.

Launch feature set:

- map/discovery
- location details
- restroom intelligence
- check-in
- quality/review/evidence
- amenities
- routes
- QR participation
- quests/rewards
- favorites
- notifications

Post-launch expansion:

- offline travel packs
- predictive occupancy/demand
- live network events
- richer social/community
- semantic/AI search

### Product 2 — Kleenest Business

This should be a **real native/Expo mobile product**, not a WebView wrapper around the current Vite surface.

Store-facing promise:

> Manage your restroom presence, reach nearby customers, and measure the real-world impact.

Primary flows:

1. Business owner signs up.
2. Creates/claims business.
3. Claims or creates canonical locations.
4. Verifies locations.
5. Configures amenities and media.
6. Creates Kleenest QR codes.
7. Creates promotions/campaigns/events.
8. Views customer engagement and restroom-health analytics.
9. Responds to reviews/quality signals.
10. Measures ROI.

Launch feature set:

- business onboarding/access
- location claim/management
- amenities
- QR management
- promotions
- campaigns
- media
- events
- reviews/response
- engagement analytics
- restroom health/benchmarking

Post-launch:

- partnerships
- enterprise networks
- fleet/operations
- contests
- single-use offers
- advanced ROI/network intelligence

## Repository target structure

```text
apps/
  consumer-mobile/        # Product 1: Kleenest Consumer
  business-mobile/        # Product 2: Kleenest Business

packages/
  platform-client/        # Supabase client/auth/session primitives
  locations/              # canonical location contracts
  intelligence/           # bathroom/location intelligence contracts
  engagement/             # QR/geofence/notifications/events
  progression/            # quests/rewards/reputation
  analytics/              # event/analytics contracts
  ui/                     # shared visual primitives
  config/                 # shared environment/build config

supabase/
  migrations/             # one canonical backend
  functions/              # server-side orchestration
```

The existing root web application should become the **business/operator development surface and administrative console**, not the second store product itself. Business-mobile should consume the same contracts and services.

## Phase plan

### Phase 0 — Freeze the platform contract

- Lock canonical location identity.
- Lock canonical check-in, review, observation, QR and geofence RPCs.
- Finish Quest idempotency.
- Finish analytics/event attribution.
- Document capability ownership.
- Remove/retire legacy/demo paths.

### Phase 1 — Store-security gate

- Resolve all Supabase Security Advisor ERROR findings.
- Review every SECURITY DEFINER function.
- Revoke unnecessary `anon`/`authenticated` EXECUTE privileges.
- Enable RLS on public tables that should not be publicly writable/readable.
- Harden mutable search paths.
- Enable leaked-password protection.
- Establish automated database lint/security checks.

### Phase 2 — Consumer release candidate

- Consumer map is populated from canonical discovery.
- Location detail never loses location identity.
- Check-in/review/evidence/QR/geofence flows are fully idempotent.
- Quest/reward progression is deterministic.
- Notifications are permission-aware.
- Foreground location is the default location strategy.
- Background location is not required for the first store release unless a core feature proves it necessary.
- Offline behavior is explicit rather than silently stale.

### Phase 3 — Business mobile

Create `apps/business-mobile` with its own:

- package/bundle identifier
- app name/icon/splash
- EAS project
- navigation
- auth/role gating
- business onboarding
- location management
- QR/promotion/campaign/event surfaces
- analytics dashboard
- settings/account deletion

Business mobile should never query raw business tables directly where a canonical RPC/service contract exists.

### Phase 4 — Shared package extraction

Move only genuinely shared logic into `packages/`.

Do not prematurely share complete screens. Share:

- types/contracts
- Supabase client/session primitives
- auth helpers
- canonical domain clients
- event schemas
- validation
- UI primitives
- design tokens

This keeps product experiences independent while preventing backend divergence.

### Phase 5 — EAS release infrastructure

Consumer already has development, preview and production EAS build profiles. Establish equivalent profiles for Business.

For both products:

- development client
- internal preview
- production build
- auto-increment versioning
- environment separation
- production Supabase URL/key configuration
- crash/error reporting
- release notes
- rollback strategy

Supabase's GitHub/CLI deployment model should be used for backend migrations and Edge Functions so the store apps and backend remain reproducible.

### Phase 6 — Apple App Store

Required work:

- App Store Connect app records.
- Unique bundle IDs for Consumer and Business.
- Apple Developer signing/certificates/profiles through EAS.
- Privacy policy URL.
- App privacy nutrition labels/data declarations.
- Location-use disclosure.
- Account deletion flow.
- Screenshots and descriptions.
- TestFlight beta.
- Review notes explaining map/location/QR functionality.
- Production submission.

Apple requires an accessible privacy policy and clear explanation of collected data, use, retention/deletion and sharing. Location services must be directly relevant and users must be informed/consent appropriately.

### Phase 7 — Google Play

Required work:

- Play Console applications for both products.
- Unique Android package IDs.
- Signing through EAS/Play App Signing.
- Data Safety form.
- Content rating.
- Privacy policy.
- Account deletion.
- Closed testing.
- Production access/release.

For the first release, prefer foreground location. Google Play's current location policy emphasizes minimum necessary scope. Background location requires a strong core-function justification, prominent disclosure and additional declaration/review requirements.

### Phase 8 — Dual-product launch

Release in this order:

1. Consumer internal QA.
2. Consumer TestFlight + Play closed testing.
3. Consumer production release.
4. Business internal QA.
5. Business TestFlight + Play closed testing.
6. Business production release.
7. Cross-product attribution/ROI validation.
8. First-market controlled launch.

## Product separation rule

The two apps share the **platform**, not the **experience**.

Consumer optimizes for speed, trust and finding a restroom.  
Business optimizes for control, visibility, engagement and measurable ROI.

They should have different navigation, onboarding, pricing, messaging, permissions and store listings.

## Definition of store-ready

A product is store-ready only when:

- no known critical security findings remain;
- every store permission has a documented product purpose;
- account creation, login, logout, password reset and deletion work;
- canonical map/location flows work with network failure and permission denial;
- user-generated content has moderation/reporting paths;
- payments/subscriptions, if enabled, are correctly disclosed;
- privacy policy and data disclosures match actual behavior;
- production builds are reproducible;
- backend migrations are versioned;
- crash/error telemetry is operational;
- TestFlight and Play closed testing have passed;
- store metadata accurately represents the shipped product.

## Strategic end state

```text
                         KLEENEST PLATFORM
                                |
              +-----------------+-----------------+
              |                                   |
       KLEENEST CONSUMER                    KLEENEST BUSINESS
              |                                   |
     Discover / Trust / Act              Manage / Market / Measure
              |                                   |
     Check-in / Evidence                 QR / Campaign / Promotion
              |                                   |
      Quest / Reputation                  Analytics / ROI / Partners
              +-----------------+-----------------+
                                |
                      Canonical location +
                    intelligence + attribution
```

This is the path from the current architecture to two independently marketable products without splitting the underlying truth system.