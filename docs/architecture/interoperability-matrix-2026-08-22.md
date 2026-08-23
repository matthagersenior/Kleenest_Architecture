# Interoperability Matrix — 2026-08-23 Production Capability Audit

## Purpose

This matrix is the migration control plane for reconciling:

`Supabase production capabilities → interoperability contract → Architecture service → AppContext → runtime consumer → route/action → realtime/offline → analytics/value`

It is intentionally broader than the runtime capability registry. A capability is not considered complete merely because a table, RPC, donor implementation, or Architecture service exists.

## Coverage model

| State | Meaning |
|---|---|
| Wired | Identity, authority, authorization, service, consumer, action, and synchronization are all reachable. |
| Partial | Core capability exists but one or more meaningful runtime/value loops remain incomplete. |
| Backend-only | Production capability exists but no confirmed Architecture action/consumer reaches it. |
| Infrastructure | Worker, ingestion, analytics, security, or other platform machinery. |
| Blocked | Identity, authoritative store, authorization, or security authority is unresolved. |

The new `public.capability_coverage_rollup` view adds operational evidence to this model: feature enabled state, user grants, access attempts, allowed outcomes, and blocked outcomes.

## Production audit snapshot — 2026-08-23

The production database contains materially more capability than the current UI exposes. The audit surfaced, among other things:

- 9,227 canonical locations; 9,222 have coordinates.
- 198 location feature summaries.
- 3,003 external observations.
- 22,404 data feature events.
- 7 active network leaderboard sources.
- 34 badges, 18 progression actions, 8 challenges, and 6 games.
- Fleet vehicles, drivers, routes, maintenance/alert infrastructure, and controller metrics.
- Enterprise partner/network/campaign/allocation/outcome infrastructure.
- Pricing, feature entitlement, QR, geofence, notification, offline, intelligence, evidence, social, and business operating-system infrastructure.

The audit also found that many catalog capabilities currently have zero feature-grant/access telemetry. This is evidence of a **runtime adoption/wiring gap**, not evidence that the underlying capability is absent.

## Matrix

| Capability | Production evidence | Architecture | Status | Next interoperability target |
|---|---|---|---|---|
| Map discovery/search | map/location discovery RPCs + canonical locations | Maps + Universal Discovery | Wired | Identity hardening |
| Canonical location identity | locations, places.location_id, identity RPCs | Map/location normalization | Partial / blocked | Fail closed when location_id cannot be resolved |
| Favorites | favorites + location_favorites + RPCs | Favorite service + Map | Blocked | One authoritative store for reads/mutations |
| GPS/QR check-in | create_check_in, verify_checkin, rewards | Check-in/Visit + QR | Wired | Preserve one mutation authority |
| Reviews/replies/rewards | review/reply/reward RPCs | Reviews + Business intelligence | Wired | Preserve review/verification semantics |
| Evidence/quality | restroom/quality/amenity observations | Location Evidence | Partial | Amenity observations, votes, richer trust read model |
| Verification campaigns | campaign/target/points/verification RPCs | Evidence infrastructure | Backend-only/partial | Operator campaign workflow |
| Contributor reputation | reputation/milestones + refresh RPCs | Reputation + Progression | Partial | Profile/reputation loop |
| Routes | route plans/stops/events | Route service + route surface | Wired | Discovery corridor lifecycle |
| Route discovery | sessions/cells/locations + prepare/populate RPCs | Routing infrastructure | Partial | Discovery sessions and discovered stops |
| Offline packs | route/area/business packs + replay events | Offline service | Partial | User-facing pack/sync management |
| External ingestion | sources/datasets/records/observations/jobs | Admin maintenance | Partial / infrastructure | Source/dataset/job monitoring |
| Promotions/redemption | promotion + redemption/reward RPCs | Business | Partial | Redemption → attribution → ROI |
| Business events/RSVP | event CRUD/analytics + RSVP | Business | Partial | Consumer event discovery/RSVP |
| Contests | create/join/entry/score | Progression | Partial | Discovery + entry + results |
| Games | progression games + record_game_result | Progression | Partial | Launcher/results |
| Challenges | challenges + completion | Progression | Partial | Detail/progress workflow |
| Quests | quest/steps/participation/geofence/QR | Engagement + Progression | Partial | Creator + participant workflow |
| QR core | creation/customization/redemption/attribution | Business + consumer QR | Partial | Complete lifecycle |
| QR engagement programs | qr_engagement_programs + CRUD/list | Backend capability | Backend-only | Business QR program manager |
| Geofencing | geofences + event/quest/notification triggers | Geofencing + Engagement | Partial | Business geofence controls |
| Preferred locations | activation/eligibility/usage | Partner/consumer backend | Backend-only/partial | Consumer activation + analytics |
| Single-use access | offers/purchases/redemption | Partner backend | Backend-only | Offer → purchase → redemption |
| Partner programs | programs/locations/members/agreements | Partner + Business/Enterprise | Partial | Complete operations |
| Enterprise networks | networks/members/campaigns/allocations/outcomes/metrics | Enterprise | Partial | Allocation/outcome operations |
| Enterprise fleet enablement | entitlement + enable RPC | Enterprise backend | Backend-only/partial | Governed enablement action |
| Fleet operations | vehicles/drivers/routes/alerts/maintenance | Fleet Operations | Wired/partial | Maintenance + alert resolution |
| Fleet metrics | definitions/assignments/config/values/leaderboards | Fleet Metrics + Performance | Wired | Contract validation |
| Fleet notifications | route updates + notification publish | Fleet/Notifications | Backend-only/partial | Route-event controls |
| Business intelligence | dashboard/growth/location/review/campaign/QR/media/partner/ROI | Business Intelligence | Partial | Operating workflows |
| Business media | media CRUD + analytics/detail | Business | Partial | Media manager/detail |
| Certifications | certification tiers/business certifications | Backend | Backend-only | Certification management |
| Clubs | clubs/members | Backend | Backend-only | Club workflow |
| Perks/search boosts | earned perks + search boosts | Backend | Backend-only | Governed perk/boost workflow |
| Business leaderboards | leaderboard + refresh | Business intelligence | Partial | Leaderboard surface |
| Social | posts/comments/likes/saves/reports/activity | Community | Partial | Action/moderation parity |
| Social challenge entries | challenge entries + progression challenges | Community/Progression | Backend-only/partial | Connect participation to Progression |
| Messaging | messages | No confirmed canonical authority | Backend-only | Establish authority before UI |
| Notifications | inbox/read/realtime | Notifications/Activity | Wired | Push subscription lifecycle |
| Push delivery | subscriptions/deliveries + queue/process RPCs | Preferences/infrastructure | Partial | Subscription management |
| Intelligence actions | action links + execute/complete/jobs | Platform Intelligence | Partial | Complete action lifecycle |
| Live network | live events + recipient resolution | Live/Activity | Partial | Mutation authority verification |
| Feature entitlements | catalog/grants/access events | AppContext/Entitlements | Wired/partial | Emit and consume coverage telemetry |
| Pricing/subscriptions | pricing catalog/plans/subscriptions | Billing/Pricing | Partial | Commerce lifecycle |
| Family | groups/members/invites + premium access | Family | Wired/partial | Member/status/entitlement management |
| Account deletion | deletion requests + RPC | Backend | Backend-only | Account settings workflow |
| Feedback/support | feedback/support requests | Support | Wired/partial | Status/history |
| Admin/governance | admin auth/CRUD/maintenance/reports/access | Owner/Admin | Wired | Maintenance coverage |
| Analytics facts | activity/feature/engagement graph | Analytics | Infrastructure/partial | Every product action emits canonical facts |

## Combined migration clusters

### 1. Location trust/value loop

`external source → observation → conflict → verification campaign → target → community observation → reputation → confidence/read model → intelligence`

This is the highest-value consumer data moat. Existing production rows mean we should wire the read/value loop rather than rebuild ingestion.

### 2. Consumer commerce/access

`partner_program → access_offer → purchase → redemption → preferred_location activation/usage → attribution`

Production is already populated enough to justify a complete runtime workflow.

### 3. Gamification engine

`game/challenge/contest/quest → participation → completion → reward/badge → reputation → leaderboard`

The database contains the primitives; Architecture should expose the behavioral loop rather than isolated catalog pages.

### 4. QR engagement engine

`QR → action type → check-in/review/survey/event/contest/content/navigation/support → attribution → reward/analytics`

The current QR surface is only a subset of the production action graph.

### 5. Business operating system

`location → amenity → media → event → promotion → QR → campaign → partner → certification → club → perk/search boost → analytics/ROI`

This is the largest remaining business expansion and can reuse the existing canonical Business service boundary.

### 6. Enterprise allocation engine

`network → partner → campaign → allocation → outcome → metric → ROI/benchmark`

Enterprise should become an operating surface, not only a summary dashboard.

### 7. Fleet operational loop

`vehicle/driver → route → performance event → alert/maintenance → scorecard → controller metric → notification/intelligence`

Most primitives exist. The remaining work is runtime reachability and event synchronization.

## Interoperability gate

Promote a capability to **Wired** only when all are true:

- canonical identity resolved;
- read and mutation stores agree;
- Production dependencies verified;
- authorization/RLS verified;
- entitlement gate explicit;
- service exposed through AppContext;
- runtime consumer exercises the real contract;
- route/action is reachable;
- offline replay uses the same authoritative mutation;
- realtime is delivery rather than source of truth;
- canonical analytics/intelligence facts are emitted;
- capability coverage telemetry can demonstrate actual use.

## Security gate

Production security review previously identified public tables requiring explicit RLS/policy decisions. Do not enable RLS blindly. For each table, first establish public-read/server-write/owner-write authority, add policies, test authenticated behavior, then enable RLS.

## Current migration strategy

Use this matrix together with the donor-feature migration ledger and Architecture runtime registry. When a Production capability already exists, prefer wiring its authoritative contract into Architecture over recreating it. When donor behavior is proven, migrate behavior into the canonical Architecture service/UI boundary rather than importing parallel legacy surfaces.
