# Interoperability Matrix — 2026-08-22 Production Investigation

## Scope

Backend-first reconciliation of Kleenest Architecture against the current `Kleenest Production` Supabase project. This matrix classifies capabilities whether wired or not; it is intentionally broader than the runtime capability registry.

## Chain used

`Production contract/data → Architecture service → AppContext → runtime consumer → route/action → events/realtime/offline`

**Wired** means the complete chain is reachable. **Partial** means the chain exists but meaningful backend capability remains unreachable. **Backend-only** means Production exposes the capability but Architecture has no confirmed runtime action. **Infrastructure** means it is worker/ingestion/analytics/security machinery rather than necessarily a user-facing feature. **Blocked** means identity/store/security authority is unresolved.

## Matrix

| Capability | Production evidence | Current Architecture | Status | Migration target |
|---|---|---|---|---|
| Map discovery/search | `map_network_nearby_v1`, `search_locations`, `locations`, `places` | Maps service + `/map` | Wired | Identity hardening |
| Canonical location identity | `locations`, `places.location_id`, identity RPCs | Map/location normalization | Partial / blocked | Fail closed when `location_id` cannot be resolved |
| Favorites | `favorites`, `location_favorites`, favorite RPCs | Favorite service + Map | Blocked | Choose one authoritative store; mutation currently points to `favorites` |
| GPS/QR check-in | `create_check_in`, `verify_checkin`, rewards | Check-in/Visit | Wired | Preserve one mutation authority |
| Reviews/replies/rewards | `create_review`, `reply_to_review`, reward summaries | Reviews + Business intelligence | Wired | Keep review and verification semantics distinct |
| Evidence/quality | restroom, quality, amenity observation RPCs/tables | Location Evidence | Partial | Amenity observations, votes, richer trust read model |
| Bathroom verification campaigns | campaigns/targets/points + verification RPCs | Evidence infrastructure | Backend-only/partial | Operator campaign workflow |
| Contributor reputation | reputation/milestones + refresh RPCs | Progression/community infrastructure | Backend-only | Contributor profile/reputation loop |
| Routes | route plans/stops/events | Route service + `/route` | Wired | Discovery corridor lifecycle |
| Route discovery | discovery sessions/cells/locations + prepare/populate RPCs | Routing infrastructure | Partial | Expose discovery sessions and discovered stops |
| Offline packs | route/area/business packs + replay events | Offline service | Partial | User-facing pack/sync management |
| External ingestion | sources, datasets, records, observations, import jobs + ingestion RPCs | Admin maintenance | Partial / infrastructure | Source/dataset/job monitoring |
| External data catalog | `search_public_data_catalog`, dataset/source tables | No confirmed user runtime | Backend-only | Governed admin catalog surface |
| Promotions/redemption | promotion CRUD + redemption/reward RPCs | Business | Partial | Complete redemption → attribution → ROI loop |
| Business events/RSVP | event CRUD/analytics + RSVPs | Business | Partial | Consumer event discovery/RSVP |
| Contests | create/join/entry/score | Progression | Partial | Contest discovery + entry + results |
| Games | progression games + `record_game_result` | Progression | Partial | Actual game launcher/results |
| Challenges | progression challenges + completion | Progression | Partial | Challenge detail/progress |
| Quests | quest/steps/participation/geofence/QR RPCs | Engagement/Progression services | Partial | Creator + participant workflow |
| QR core | QR creation/customization/redemption/attribution | Business + consumer QR | Partial | Complete lifecycle |
| QR engagement programs | `qr_engagement_programs` + CRUD/list | No confirmed runtime consumer | Backend-only | Business QR program manager |
| Geofencing | geofences + event/quest/notification triggers | Geofencing + Engagement | Partial | Business geofence manager + event controls |
| Preferred locations | activation/eligibility/usage | Partner/consumer backend | Backend-only/partial | Consumer activation + Business analytics |
| Single-use access | offers/purchases/redemption | Partner service/backend | Backend-only | Offer → purchase → redemption |
| Partner programs | programs/locations/members/agreements | Partner + Business/Enterprise | Partial | Complete agreement/member/location operations |
| Enterprise networks | networks/members/campaigns/allocations/outcomes/metrics | Enterprise command | Partial | Allocation and outcome operations |
| Enterprise fleet enablement | entitlement + enable RPC | Enterprise backend | Backend-only/partial | Governed enablement action |
| Fleet operations | vehicles/drivers/routes/alerts/maintenance | Fleet Operations | Wired/partial | Maintenance + alert resolution |
| Fleet controller metrics | definitions/assignments/config/values/leaderboards | Fleet Metrics + Performance | Wired | Continue contract validation |
| Fleet notifications | route updates + publish notification | Fleet backend/notification infrastructure | Backend-only/partial | Route-event notification controls |
| Business intelligence | dashboard/growth/location/review/campaign/QR/media/partner/ROI RPCs | Business Intelligence | Partial | Turn remaining contracts into operating workflows |
| Business media | media CRUD + analytics/detail | Business service | Partial | Media manager/detail |
| Certifications | certification tiers/business certifications | Backend | Backend-only | Certification status/management |
| Clubs | membership clubs/members | Backend | Backend-only | Club workflow |
| Perks/search boosts | earned perks + search boosts | Backend | Backend-only | Governed perk/boost workflow |
| Business leaderboards | business leaderboard table + refresh | Business intelligence | Partial | Leaderboard surface |
| Social | posts/comments/likes/saves/reports/activity | Community | Partial | Full moderation/action parity |
| Social challenge entries | challenge entries + progression challenges | Community/Progression | Backend-only/partial | Connect participation to Progression |
| Messaging | `messages` | No confirmed canonical runtime | Backend-only | Define messaging authority before UI |
| Notifications | inbox/read/realtime | Notifications/Activity | Wired | Push subscription lifecycle |
| Push delivery | subscriptions/deliveries + queue/process RPCs | Preferences/infrastructure | Partial | Subscription management; worker remains backend-owned |
| Intelligence actions | action links + execute/complete/jobs | Platform Intelligence | Partial | Complete action-link lifecycle |
| Live network | live events + publish/recipient resolution | Live/Activity | Partial | Verify mutation authority |
| Feature entitlements | catalog/user entitlements/access events | AppContext/entitlement services | Wired/partial | Surface gating outcomes in workflows |
| Pricing/subscriptions | pricing catalogs/plans/subscriptions | Billing/Pricing | Partial | Complete commerce lifecycle if approved |
| Family | groups/members/invites + premium access | Family | Wired/partial | Member/status/entitlement management |
| Account deletion | deletion requests + RPC | No confirmed route | Backend-only | Account settings deletion workflow |
| Feedback/support | feedback/support requests | Support | Wired/partial | Status/history |
| Admin/governance | admin auth/CRUD/maintenance/reports/business access | Owner/Admin | Wired | Continue maintenance coverage |
| Analytics facts | activity/feature/engagement event graph | Analytics service | Infrastructure/partial | Ensure product actions emit canonical facts |

## Highest-value migration clusters

### Consumer commerce/access

`partner_program → single_use_access_offer → purchase → redemption → preferred_location activation/usage → attribution`

**Backend:** present. **Runtime:** incomplete.

### Gamification expansion

Games, challenges, contests, quests, streaks, badges, leaderboard rewards, contributor reputation/milestones are all represented in Production. The current Progression surface is not yet the full behavioral product.

### QR engagement engine

Production QR programs support check-in, reward, promotion, review, survey, event, contest, content, navigation, support, and custom actions. Current runtime is only a subset.

### Location trust network

`external source → observation → conflict → verification campaign → target → community observation → contributor reputation → confidence/read model`

The current evidence workflow is only one entry point into this larger graph.

### Business operating system

`locations → amenities → media → events → promotions → QR → campaigns → partners → certifications → clubs → perks → search boosts → analytics → ROI`

This is the largest remaining business feature expansion.

### Enterprise allocation engine

`network → partners → campaigns → allocations → outcomes → metrics → ROI/benchmark`

The Enterprise command center should become an operating surface, not merely a summary.

### Fleet operational loop

`vehicle/driver → route → performance event → alert/maintenance → scorecard → controller metric → notification/intelligence`

Mostly present; maintenance, alerts, and route notifications need complete runtime reachability.

## Critical interoperability blockers

1. **Favorites:** Production contains both `favorites` and `location_favorites`. The authoritative favorite mutation uses `favorites`; Architecture must not read one store and mutate another.
2. **Location identity:** `places.id` is not `locations.id`. Any check-in/review/evidence/routing capability must resolve explicitly to `locations.id`.
3. **Follow/messaging:** Production exposes contracts, but canonical table/service authority is not yet sufficiently verified for safe full wiring.

## Production security finding

Supabase's current schema advisory identifies **9 public tables with RLS disabled**:

- `leaderboard_rewards`
- `network_leaderboard_sources`
- `network_leaderboard_participation`
- `geofence_events`
- `qr_engagement_programs`
- `quests`
- `quest_steps`
- `quest_participation`
- `quest_step_events`

This is a critical security finding. **Do not automatically enable RLS without policies** because doing so can block legitimate application access. The remediation must first define public-read/server-write/owner-write authority for each table, then enable RLS and add policies.

## Application index

The root route is now a functional product index rather than a capability catalog. `/` links directly to Discover, Routes, Verify, Progression, Community, Activity, Business, Fleet, Enterprise, Family, Intelligence, and authorized Owner controls. `/capabilities` remains reference/architecture tooling.

## Gate for promoting a capability to Wired

- canonical identity resolved;
- read and mutation stores agree;
- Production dependencies verified;
- authorization/RLS verified;
- entitlement gate explicit;
- service exposed through AppContext;
- runtime consumer exercises the real contract;
- route/action reachable;
- offline replay uses the same authoritative mutation;
- realtime remains delivery, not source of truth;
- canonical analytics/intelligence facts emitted.
