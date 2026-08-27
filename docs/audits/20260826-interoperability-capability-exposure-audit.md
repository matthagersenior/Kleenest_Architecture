# Kleenest — 2026-08-26 Interoperability / Capability Exposure Audit

## Authority

- **Canonical source:** `matthagersenior/Kleenest_Architecture:main`
- **Backend authority:** Production Supabase project `ssgesjzdvdsqacdtasje`
- **Reference only:** `matthagersenior/Kleenest_App:main` and other Kleenest repositories
- **Rule:** a backend object is not a product feature until a canonical UI action reaches it through the canonical service/AppContext/route boundary with authorization, refresh, telemetry, and offline/realtime behavior where applicable.

## Audit snapshot

Production currently reports approximately 201 public tables, 446 information-schema routines, 273 RLS policies, and 74 triggers. The capability-control layer contains 32 enabled feature-catalog entries, 6 active domain contracts, 442 function-classification rows, and 26 retirement records.

The important reconciliation finding is that the existing raw capability audit reports **433 uncovered RPCs**, but that number is largely an artifact of comparing the full function surface against only six active `capability_domain_contracts`. It must not be interpreted as 433 missing product capabilities. Function classification and the retirement log are the stronger current governance signals.

The live security check found exactly one `SECURITY DEFINER` public function still executable by `anon`: `admin_list_activity_events(integer)`. It was revoked immediately in Production and a migration was committed to `main` to make that boundary persistent.

## Capability → exposure matrix

Status:

- **GREEN** — canonical UI surface is present and the feature has a recognizable front-to-back path.
- **YELLOW** — UI/backend evidence exists, but at least one integration leg still needs end-to-end verification or consolidation.
- **ORANGE** — backend/service capability exists but the operator-facing termination is incomplete or indirect.
- **BLUE** — infrastructure/worker capability; should not be forced into a normal consumer/operator screen.
- **RED** — backend capability exists but no verified canonical user-facing termination was found in this pass.

| Feature | Backend capability | Current canonical exposure | Status | Next wiring slice |
|---|---|---|---|---|
| Data Control Center | admin capability/data controls | Owner Control Center | GREEN | Admin / governance |
| Business Analytics | business analytics/metrics | Business Intelligence | GREEN | Business outcome |
| Custom Business Notifications | business notification RPCs | Business Notifications route | GREEN | Business outcome |
| Business Engagement | engagement/attribution | Business management/growth panels | GREEN | Business outcome |
| Business Intelligence | intelligence summaries/actions | Business Intelligence route | GREEN | Business outcome |
| Business QR | QR creation/status/attribution | Business management QR controls | GREEN | Business outcome |
| QR Studio | QR backend capability | No dedicated verified studio surface | ORANGE | Business outcome |
| Business Workspace | business membership/context | Business workspace | GREEN | Business outcome |
| Verify Amenities | amenity observation/verification | Location contribution/detail flows | YELLOW | Consumer evidence |
| Deep Bathroom Verification | bathroom verification/intelligence | Verification/evidence surfaces | YELLOW | Consumer evidence |
| Add Location Photo | location photo/evidence | Location/review evidence UI | GREEN | Consumer evidence |
| Rate Location | location quality/review | Location interaction surfaces | GREEN | Consumer evidence |
| Helpful Review Vote | review likes/votes | Review interaction path exists; end-to-end verification required | YELLOW | Consumer evidence |
| GPS Check In | canonical check-in RPC | Consumer place/map actions | GREEN | Consumer evidence |
| QR Check In | QR check-in path | QR/check-in actions | GREEN | Consumer evidence |
| Enterprise Network Analytics | enterprise network metrics/intelligence | Enterprise Command Center/operations | GREEN | Enterprise outcome |
| Enterprise Workspace | enterprise membership/context | Enterprise workspace | GREEN | Enterprise outcome |
| Fleet Analytics | fleet metric/analytics | Fleet workspace/dashboard | GREEN | Fleet operations |
| Driver Safety Scorecards | fleet driver scorecards | Fleet scorecard surfaces | GREEN | Fleet operations |
| Fleet Intelligence | fleet intelligence | Fleet intelligence/dashboard | GREEN | Fleet operations |
| Fleet Maintenance | maintenance records/workflow | Fleet maintenance controls | GREEN | Fleet operations |
| Fleet Metric Configuration | metric configuration/controller | Fleet metric controls | GREEN | Fleet operations |
| Fleet Operations | operational events/controls | Fleet operations workspace | GREEN | Fleet operations |
| Fleet Route Optimization | route planning/optimization | Fleet routes + canonical map | GREEN | Fleet operations |
| Restroom Service Opportunities | service-opportunity intelligence | Fleet/field opportunity surfaces | YELLOW | Fleet operations |
| Telematics Ingestion | operational telemetry | Worker/ingestion boundary; no normal operator UI | BLUE | Fleet operations |
| Vehicle Utilization | vehicle daily metrics | Fleet metric/dashboard surfaces | YELLOW | Fleet operations |
| Fleet Workspace | fleet membership/context | Fleet workspace | GREEN | Fleet operations |
| Badges | progression/badge authority | Rewards/badges | GREEN | Trust/progression |
| Challenges | progression/social challenge authority | Rewards + challenge flow | GREEN | Trust/progression |
| Quest Creator | quest creation/dispatch | Quest creator/player workflow | GREEN | Trust/progression |
| Advanced Route Planner | route plans/stops/events | Map + route tray + route workspace | GREEN | Maps/routing |

## Domain interoperability matrix

| Domain | Supabase authority | Canonical service/runtime evidence | User termination | Interop risk | Disposition |
|---|---|---|---|---|---|
| Identity / access | Auth, profiles, entitlements, pricing | AppContext/auth/entitlement services | Auth + account/workspace routing | medium | verify first |
| Locations / discovery | locations/places/discovery RPCs | location + map services | Map/search/place detail | medium | foundation |
| Quality / verification | observation/verification tables + RPCs | evidence/verification services | contribution/verification controls | medium | finish evidence loop |
| Maps / routing | route plans/stops/events + map RPCs | MapSurfaceV3 + route services | map, route tray, navigation | medium | finish route outcome loop |
| Check-ins | check-in RPCs/tables | canonical check-in service | place/map check-in | low | verify |
| Reviews / evidence | reviews/photos/likes | review/evidence services | place/review UI | medium | verify votes/photos |
| Favorites / QR | favorites + QR authority | favorite/QR services | save, scan, redeem | medium | join attribution |
| Social / messaging / family | social, messages, family tables | partial canonical coverage | some surfaces, incomplete audit | high | dedicated slice |
| Progression / rewards | progression, badges, rewards, challenges | progression services | Rewards / games / challenges | medium | join to evidence/reputation |
| Business | businesses, campaigns, promotions, QR, events | BusinessManage + growth/intelligence/notifications | Business workspace | medium | close outcome chain |
| Partners | partner programs/agreements/preferred locations | partner service + business partnerships route | Business partnerships | medium | close lifecycle |
| Enterprise | partner networks/campaigns/outcomes/allocations | Enterprise operations/lifecycle/intelligence | Enterprise workspace | medium | close outcome chain |
| Fleet | vehicles/drivers/routes/metrics/events/maintenance | Fleet services + dedicated workspaces | Fleet workspace | medium | close operational chain |
| Intelligence / notifications | jobs/actions/deliveries/preferences | intelligence + notification services | Notifications/actions | high | unify event source |
| Live network | live network events | live network service | map/network surfaces | medium | verify privacy + replay |
| Analytics | analytics/data-feature events | analytics/AppContext telemetry | hidden product telemetry | medium | validate activation |
| Offline | offline packs/replay | offline services + AppContext | offline pack/replay controls | high | converge with online authority |
| Admin / support | admin controls, feedback, support | Owner/Admin surfaces | Owner/Admin | high | governance slice |

## Reference-repository findings

`Kleenest_App:main` remains useful as a behavior/reference source. Its current head is an offline-replay change, confirming that offline event queuing/replay is a proven historical behavior rather than a speculative feature. The Architecture repository has already moved this concept into canonical AppContext/service paths. Reference code must not be copied wholesale.

The Architecture commit history shows that recent implementation has already promoted substantial functionality: canonical MapSurfaceV3 routing, multi-stop route drafts/snapshots, dedicated Fleet route CRUD, Business CRUD, Enterprise CRUD/lifecycle controls, business partner and custom-notification workflows, challenge/badge/game progression, owner membership preview, and workspace-specific navigation.

## Newly required interoperability rule

Every implementation slice must be verified as this chain:

`Supabase authority → authorization/entitlement → domain service → AppContext → canonical route → human control → authoritative query/mutation → refresh/realtime → telemetry → offline replay where applicable`

If any link is missing, the capability remains YELLOW/ORANGE regardless of how complete the UI looks.

## Implementation slices — front to back, not file batches

### Slice 0 — Governance and authority repair

1. Keep `Kleenest_Architecture:main` authoritative.
2. Reconcile live migration history against repository migrations.
3. Replace the raw six-contract audit as the primary coverage denominator with classified canonical/supporting/compatibility/legacy functions.
4. Require zero unexplained public functions, with privileged/internal functions explicitly classified.
5. Keep the anonymous execute boundary closed for privileged `SECURITY DEFINER` RPCs.

### Slice 1 — Consumer evidence loop

`GPS/QR check-in → location observation → amenity/bathroom evidence → photo → review → review vote → reputation/milestone → notification`

Front end: map/place details, contribution controls, review controls, rewards feedback.

Back end: canonical check-in/observation/review/verification RPCs, RLS, reputation triggers.

Done when a single real contribution visibly changes the authoritative location/reputation state and refreshes all dependent surfaces.

### Slice 2 — Maps + routing outcome loop

`GPS → universal discovery → canonical map → add stops → route draft → rich stop snapshot → publish/complete → navigation → route event → telemetry`

Front end: MapSurfaceV3, persistent route tray, route workspace.

Back end: discovery RPC, route plan/stops/events, live-network publication boundary, snapshot persistence.

Done when route state survives map/detail navigation and completion creates authoritative activity without duplicate hydration.

### Slice 3 — Trust-first progression/social loop

`evidence/check-in/review → game/challenge/quest → progression → badge/level/reputation → leaderboard → notification`

Front end: Games, Rewards, Challenges, Quest Creator.

Back end: progression authority, challenge state, badge evaluation, notification materialization.

Done when gameplay can only reward authoritative activity and multiplayer state remains synchronized.

### Slice 4 — Business growth loop

`managed business/location → QR/geofence → campaign/event/promotion → engagement/redemption → attribution → analytics/ROI → notification`

Front end: Business Manage, Intelligence, Notifications, Partnerships, QR/engagement controls.

Back end: business canonical CRUD/campaign/promotion/event/QR/attribution RPCs and entitlement gates.

Done when an operator creates an asset, a consumer can interact with it, and the business can see the resulting attributable outcome.

### Slice 5 — Fleet operations loop

`vehicle/driver → route/geofence → operational event → service opportunity → metric → safety/maintenance score → prioritized notification → fleet console`

Front end: Fleet dashboard, routes, maintenance, metrics, scorecards, opportunities.

Back end: fleet CRUD, routes, telemetry, metric authority, intelligence/notification contracts.

Done when an operational event produces a metric and actionable notification visible in the correct fleet workspace.

### Slice 6 — Enterprise network loop

`partner/network → member/location allocation → campaign/contest → engagement/QR → outcome → benchmark/ROI → governance`

Front end: Enterprise Command Center, Operations, Lifecycle, membership CRUD.

Back end: enterprise network/campaign/allocation/outcome RPCs and Fleet/Enterprise authorization boundary.

Done when an enterprise outcome is traceable from network allocation through consumer/business activity.

### Slice 7 — Access/commerce outcome loop

`pricing/entitlement → offer → purchase → redemption → attribution → reward/outcome telemetry`

Commerce must remain behind the Stripe boundary when implemented. Do not mark commerce complete from Supabase pricing tables alone.

### Slice 8 — Intelligence + notification convergence

`domain event → intelligence job/action → notification materialization → delivery → actionable deep link → read state → analytics`

Unify business, fleet, enterprise, consumer, and live-network notification producers onto the same authoritative path.

### Slice 9 — Offline/realtime convergence

All slices above must use the same command/event semantics online and offline. Offline replay must be idempotent, attributable, and followed by the same refresh/realtime propagation as an online mutation.

## Acceptance gate

A slice is complete only when:

- the canonical UI is reachable;
- no duplicate runtime/service owns the capability;
- the backend authority is explicit;
- authorization and entitlement are tested;
- the mutation/query is real, not demo/mock state;
- dependent UI refreshes from authoritative state;
- telemetry records the meaningful action;
- realtime/offline behavior does not fork the business logic;
- security/RLS/grants are verified;
- the slice has a coherent commit and audit note.
