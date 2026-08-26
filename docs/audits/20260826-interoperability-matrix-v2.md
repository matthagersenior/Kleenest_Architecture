# Kleenest Interoperability Matrix v2

**Date:** 2026-08-26

## Legend

- **C** = canonical authority exists and should remain the source of truth.
- **S** = supporting capability exists.
- **W** = wiring/UX/authorization still required.
- **G** = product gap: capability exists in backend but is not yet a complete product feature.
- **H** = hardening gate required before production/store release.

## Core matrix

| Domain | Consumer | Business | Platform/Shared | Key handoff | Status |
|---|---|---|---|---|---|
| Location identity | Discover/use | Claim/manage | Canonical locations | location_id | C |
| Location discovery | Map/search | Business listing visibility | Universal discovery | discovery → location | C/W |
| Bathroom intelligence | Trust/status | Business health | Intelligence engine | observations → intelligence | C/W |
| Amenities | Filter/report | Configure/respond | Amenity catalog | amenity → location | C/W |
| Check-in | Yes | Attribution | Canonical check-in | check-in → analytics/quest | C |
| Reviews | Create/read | Respond/analyze | Review authority | review → quality/reputation | C/W |
| Evidence | Submit | Consume/respond | Verification/reputation | evidence → intelligence | C/W |
| QR | Scan/redeem | Create/customize/analyze | QR authority | QR → attribution/action | C/W |
| Geofence | Receive contextual event | Configure location geofence | Event/notification authority | geofence → quest/notification | C/W/H |
| Quests | Participate | Create/sponsor later | Quest engine | event → step → progression | C/W |
| Progression | XP/rewards | Campaign/contest rewards | Progression authority | canonical event → reward | C/W/H |
| Reputation | Contributor trust | Business quality trust | Reputation engine | evidence → reputation | C/W |
| Leaderboards | User/community | Business/fleet | Ranking engine | metrics → ranking | S/W |
| Routes | Build/execute | Optional fleet/ops | Route planning | location set → route | C/W |
| Offline | Offline discovery | Offline business data | Offline packs | cache → sync | C/W |
| Notifications | User alerts | Business alerts | Notification pipeline | event → delivery | C/W/H |
| Media | Photos | Business media | Storage | media → location | S/W |
| Promotions | Discover/redeem | Create/manage | Attribution/redemption | promotion → redemption | C/W |
| Campaigns | Participate | Create/measure | Analytics | exposure → conversion | S/W |
| Events | Discover/RSVP | Create/manage | Event/RSVP data | event → RSVP | S/W |
| Partnerships | Receive perks | Partner programs | Network/ROI | program → allocation → outcome | S/G |
| Business intelligence | Limited user insights | Full dashboard | Analytics engine | facts → metrics | C/W |
| Fleet | No | Enterprise | Fleet domain | route → vehicle/driver | S/G |
| Enterprise networks | No | Enterprise | Network intelligence | campaign → allocation → outcome | S/G |
| Single-use offers | Purchase/redeem | Create/manage | Access/commerce | offer → purchase → redemption | S/G |
| Social/family | Follow/family | No | Community | relationship → feed/engagement | S/G |
| Games/challenges | Optional | Sponsor | Game engine | result → progression | S/G |

## Critical event interoperability

| Source fact | Must feed | Must not bypass |
|---|---|---|
| Canonical location | map, detail, route, analytics, intelligence | ad-hoc location records |
| Check-in | evidence, review, quest, progression, reputation, analytics | client-only reward logic |
| Bathroom observation | intelligence, freshness, reputation, quest, analytics | direct quality overwrite |
| Quality review | intelligence, reputation, quest, analytics | parallel rating store |
| Amenity observation | amenity confidence, intelligence, quest | business truth overwrite |
| QR redemption | attribution, check-in/action, quest, analytics, promotion | duplicate conversion event |
| Geofence event | notification, quest, analytics | client-only geofence reward |
| Promotion redemption | campaign ROI, analytics, business reporting | manual analytics-only conversion |
| Review response | business engagement analytics | shadow review state |
| Business claim | location authority, business access, verification | duplicate business location |
| Campaign exposure | attribution, analytics, ROI | unlinked ad impression |
| Quest completion | progression, reputation where applicable, leaderboard | second reward path |

## Two-product boundary

### Kleenest Consumer

Owns:

- discovery/map
- restroom details
- routes
- check-in
- cleanliness/quality contribution
- amenity confirmation
- bathroom verification
- photos/evidence
- QR participation
- geofence experiences
- quests/rewards
- reputation
- leaderboards/community
- favorites/preferred locations
- offline travel mode
- consumer notifications

Consumes business capabilities through read-only or interaction contracts:

- verified business listing
- business amenities
- promotions
- events
- QR programs
- sponsored discovery

### Kleenest Business

Owns:

- business onboarding and access
- location claim/verification
- location management
- amenity management
- media
- QR creation/customization
- promotions
- campaigns
- events
- customer engagement analytics
- restroom quality/health analytics
- benchmark reporting
- partnerships
- enterprise/fleet modules where entitled

Consumes consumer-generated facts through governed analytics/intelligence contracts:

- visits/check-ins
- reviews
- observations
- amenity feedback
- QR attribution
- promotion redemptions
- engagement signals

### Platform

Owns:

- authentication/authorization
- canonical location identity
- PostGIS/geospatial primitives
- evidence/reputation authority
- analytics/event model
- notifications
- intelligence computation
- progression primitives
- QR authority
- geofence events
- shared storage/security
- audit/governance

## Highest-risk missing handoffs

1. **Map discovery → detail → action** must always preserve the same canonical location ID.
2. **Check-in → evidence/review → intelligence** must not create duplicate location facts.
3. **QR → promotion/check-in/quest** needs one attribution identity.
4. **Geofence → notification/quest** needs server-authoritative event IDs and retry idempotency.
5. **Quest → reward/progression** must have one authoritative reward path.
6. **Business claim → location identity** must never create a second location.
7. **Consumer-generated facts → business analytics** need entitlement and privacy boundaries.
8. **Background location → notifications** requires store-policy-compliant disclosure and minimum-scope permissions.
9. **Media → Storage → location** needs ownership, moderation and deletion lifecycle.
10. **Offline cache → online canonical data** needs deterministic reconciliation rules.

## Store-readiness interoperability gates

| Gate | Android | iOS | Shared |
|---|---|---|---|
| Auth/account lifecycle | Required | Required | Required |
| Account deletion | Required | Required | Required |
| Privacy policy | Required | Required | Required |
| Data collection disclosures | Required | Required | Required |
| Foreground location | Required | Required | Required |
| Background location | Only if justified/approved | Only if genuinely needed | High-risk; avoid unless core |
| Push notification consent | Required | Required | Required |
| Media permissions | Required | Required | Required |
| Subscription/payment declarations | Required if monetized | Required if monetized | Required |
| Crash/error observability | Recommended | Recommended | Required for release |
| Production auth/RLS audit | Required | Required | Required |
| EAS signing/build profiles | Required | Required | Required |
| Closed/beta testing | Play testing | TestFlight | Required |

## Matrix rule

No new feature is considered complete until it has:

**UI action → canonical RPC/fact → authorization → downstream consumers → analytics → retry/idempotency behavior → privacy/store implications → test coverage.**
