# Batch AO — Full Architecture Audit

Date: 2026-08-22

## Executive result

The architecture reconciliation is complete enough to establish canonical ownership and begin controlled implementation, but the application is **not yet safe for broad UI wiring**. The remaining blockers are concrete authority/correctness defects in existing backend paths, not missing generalized architecture.

The canonical architecture is therefore:

`CanonicalAppRuntime`
→ `domain capability`
→ `canonical identity / entitlement / authorization`
→ `single authoritative Supabase command/read boundary`
→ `server projections + events + workers`
→ `normalized UI read model`

No page owns cross-domain data. No client recreates server-side trigger effects. No cache/realtime stream becomes a source of truth.

## 1. Canonical ownership map

| Domain | Owns | Consumes | Must not own |
|---|---|---|---|
| Identity | actor/profile/session identity | Supabase Auth | product authorization decisions outside its contract |
| Entitlements | account/product entitlement resolution | service entitlements, feature catalog | business membership authorization |
| Business | business lifecycle, commercial/growth state | locations, entitlements, analytics | generic location identity |
| Locations | canonical physical-place identity and shared location projections | ingestion/evidence | user-specific state |
| Location Quality | observations/reviews/evidence quality | canonical locations, provenance | raw external ingestion ownership |
| Maps | discovery/map population/presentation retrieval | canonical locations, quality/intelligence | Fleet operational state |
| Routing | route plans/stops/events + generic route discovery | canonical locations | Fleet-specific operational commands |
| Check-ins | user arrival/check-in command contract | canonical location/QR/GPS | reward duplication |
| Reviews | review mutation/read model | verified check-in/location | rating/counter/gamification projection writes |
| Favorites | user/location favorite state + route attribution | canonical location | alternate favorite store |
| QR | QR scan/redemption attribution | check-in authority | second competing check-in authority |
| Progression/Rewards | explicit progression commands/read models | authoritative domain events | duplicate awards already produced by triggers |
| Social | social relationships/content/interactions | identity/location | generic gamification duplication |
| Enterprise/Partners | partner networks, allocations, outcomes, ROI | business/location facts | Fleet operational ownership |
| Fleet | fleet operational state, telemetry, scorecards, intelligence | routes/locations/business | generic route discovery, generic metric engine |
| Fleet Business Config | controller metric definitions/goals/scope/scoring | shared measurement primitives | operational facts themselves |
| Intelligence | derived recommendations/actions/jobs | canonical facts/evidence | canonical source facts |
| Live Network | event stream/read model | domain events | authoritative domain state |
| Notifications | event/materialization/delivery/read state | domain/intelligence events | source-domain mutation semantics |
| Analytics | derived aggregations/read models | canonical facts/events | shadow source facts |
| Offline | cache/queue/replay orchestration | canonical read models + authoritative commands | independent business truth |
| Admin/Support | privileged administration/support workflows | all authorized domains | ordinary consumer authority |

## 2. Cross-cutting infrastructure

### Identity

Authenticated identity comes from Supabase Auth. Browser code must not manufacture actor/account identity.

### Entitlements

Access resolution remains layered:

`authenticated user`
→ `account/service entitlement`
→ `business/domain authorization`
→ `feature catalog capability`
→ `domain operation`

These layers are deliberately distinct.

### Event spine

`data_feature_events` is a cross-domain telemetry spine, while table triggers/server commands remain authoritative for source facts. Frontend services must not emit a duplicate canonical event when the source mutation already produces one.

### Progression

Progression/reward commands are server-side. Automatic trigger-owned activities must not be followed by another reward-capable progression command for the same activity.

### Notifications

The canonical chain is:

`domain/intelligence event`
→ `notification event`
→ `notification materialization`
→ `delivery`
→ `push/realtime`
→ `user action`

Queue/materialization/push worker functions are infrastructure, not ordinary UI capabilities.

### Workers and schedules

Maps ingestion and Intelligence notification/action workers are active backend systems. Architecture must model these as dependencies rather than pretending the UI performs their work synchronously.

## 3. Canonical shared-data identities

### Location

`locations.id` is the canonical physical-place identity. `places.id` is a presentation/discovery identity and must resolve through `places.location_id`.

A capability requiring canonical location identity must fail closed when resolution is unavailable.

### Route

`route_id` and `location_id` remain separate identities. Generic route discovery belongs to Routing/Maps. Fleet routes consume route infrastructure but do not own generic discovery.

### User state

Favorites, check-in state, route context, sessions, and entitlements are attached contexts. They must not be embedded into a shared cached LocationContract as if they were public location facts.

## 4. Normalized LocationContract

The canonical location read model should expose distinct semantic layers:

- identity/address/geospatial/provenance;
- bathroom verification status/source/timestamps;
- location verification status;
- verification observation counts/confidence;
- bathroom evidence projections;
- quality/review projections;
- intelligence confidence score/level;
- optional user-state attachments.

In particular:

`verificationObservationConfidence` ≠ `locationConfidenceScore`.

A display-only `isVerified` helper may simplify presentation, but individual features may not invent their own verification thresholds.

## 5. Fleet architecture

Fleet telemetry already exists as:

`operational/performance events`
→ `vehicle/driver/business measurements`
→ `scorecards/snapshots`
→ `leaderboards/progression consumers`

The missing layer is only:

`business + controller + metric definition + goal/threshold + scoring + scope`

The future implementation must be a **thin business-scoped configuration adapter** over shared measurements. It must not become a second measurement engine.

Required conceptual authorization separation:

- Observe
- Configure
- Operate

`has_fleet_access` alone must not be treated as permission to configure metrics.

## 6. Confirmed wiring blockers

### BLOCKER A — follows

`follow_user()` targets `user_follows`, while the canonical live relationship table is `follows`.

**Action:** reconcile the backend function before wiring follows.

### BLOCKER B — favorites

Production exposes both `favorites` and `location_favorites`, while mutation/read paths do not consistently use the same store.

**Action:** choose the store used by the authoritative mutation contract and converge all consumers.

### BLOCKER C — check-in aggregation

`create_check_in` and downstream check-in trigger processing have overlapping profile/check-in aggregation effects.

**Action:** test authoritative totals and eliminate duplicate aggregation before wiring check-in/reward UI.

### BLOCKER D — QR check-in authority

`redeem_qr_code` and `verify_checkin` represent separate check-in paths with different reward behavior.

**Action:** explicitly model scan/redemption modes and prevent one physical action from entering two check-in/reward authorities.

### BLOCKER E — bathroom verification authority

Multiple RPCs/triggers write overlapping `locations.bathroom_*` projections.

**Action:** reconcile field-level writers and idempotency before wiring verification UI.

### BLOCKER F — contest progression

Contest submission can reach gamification through the database trigger and a client follow-up `record_progression_metric_event` call.

**Action:** remove the duplicate reward path or establish a proven non-rewarding metric contract.

### BLOCKER G — trusted verification reward authority

The trusted bathroom verification RPC directly updates profile points while trigger documentation identifies gamification as the reward authority.

**Action:** reconcile reward ownership before wiring trusted verification.

### BLOCKER H — canonical location normalization

Frontend normalization has historically allowed a place ID to stand in for `location_id` when canonical resolution is absent.

**Action:** fail closed for mutations requiring canonical location identity.

## 7. Security findings

### Partner benchmark authorization

`get_partner_network_benchmark()` is `SECURITY DEFINER` without the owner-business authorization predicate present in neighboring partner analytics functions.

**Action:** remediate through a reviewed Supabase migration after caller/role verification. Do not compensate in the client.

### Privileged RPC classification

Every SECURITY DEFINER function must be classified as:

- `public_read`
- `authenticated_command`
- `privileged_command`
- `worker_internal`
- `legacy_unclassified`

Worker-like delivery/materialization/recipient-resolution RPCs should not remain exposed as generic client capabilities without a verified product reason.

## 8. Existing capability clusters that are NOT missing

The following were explicitly reconciled and should not be rebuilt:

- external location ingestion;
- OSM ingestion;
- external observations/provenance;
- quality observations and moderation;
- generic route discovery;
- account entitlement resolution;
- feature catalog;
- Fleet operational telemetry;
- Fleet scorecards/snapshots;
- enterprise partner networks and analytics;
- business leaderboards;
- notification event/materialization/delivery infrastructure;
- Maps and Intelligence scheduled workers;
- shared feature-event capture;
- server-side progression/reward infrastructure.

## 9. Architecture-only implementation target

The only new domain contract justified by the audit is:

`Fleet Business Metric Configuration`

It should remain architecture-only until the required Production schema/RPC contract is deliberately designed and tested in an isolated Supabase development environment.

It must not call invented RPC names, write `feature_catalog.configuration`, or write operational Fleet facts.

## 10. Runtime/wiring gate

The Architecture contract is **READY FOR IMPLEMENTATION**, but broad UI wiring is **BLOCKED** until the correctness blockers above are reconciled.

Safe order:

1. resolve backend authority blockers in an isolated Supabase development environment;
2. create/verify canonical domain adapters;
3. build the canonical runtime/shell around those adapters;
4. wire read surfaces;
5. wire authoritative commands;
6. verify trigger/event/projection side effects;
7. add offline replay against the same commands;
8. remove duplicate legacy paths;
9. run end-to-end capability tests;
10. only then promote verified changes toward Production.

No Production mutations were performed during this architecture audit.
