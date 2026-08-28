# Kleenest Architecture — Current Progress & Audit Plan

**Authoritative repository:** `matthagersenior/Kleenest_Architecture`

**Authoritative working branch:** `main`

**Last updated:** 2026-08-28

## 1. Non-negotiable implementation rule

Nothing is considered implemented merely because a database object, RPC, Edge Function, service, registry entry, route, dashboard card, button, or page exists.

A capability is **DONE** only when the complete path is wired and usable:

`Supabase capability/function → service/data contract → entitlement/tier → route → UI surface → actionable control → successful behavior → resulting state/feedback`

Every future implementation and every audit must enforce this rule.

## 2. Current frontend progress

### Architecture and runtime

- Canonical application runtime and workspace routing are being consolidated around the current `main` architecture.
- Owner, Admin, Consumer, Business, Fleet, and Enterprise surfaces are represented in the runtime.
- Capability navigation is intended to be canonical rather than a collection of disconnected mock pages.
- Reporting was repaired to use scope-aware queries and selected-business context.
- Reporting settings/history were brought into the same service boundary and reporting lifecycle refresh events were added.
- Owner Command Center rendering was repaired after malformed JSX caused controls to become unreliable.
- Owner Operational Capabilities was moved away from the stale archaeology-style presentation toward the canonical capability registry model.
- Capability Hub was expanded to surface backend/Supabase capability contracts and the live feature catalog.
- Membership Preview was repaired so tier buttons use canonical runtime preview keys rather than raw product IDs.

### UI quality/audit tooling

- `scripts/ui-interaction-audit.mjs` exists for static interaction coverage checks.
- `scripts/ui-interaction-audit-report.mjs` was added to report buttons without actions and placeholder/dead anchors.
- `scripts/ui-route-audit.mjs` was added to identify likely static navigation targets without corresponding runtime files.
- These tools are supplemental. They do **not** replace manual/behavioral verification of every important control.

## 3. Recent confirmed UI defects and repairs

### Reporting

The reporting service had an inconsistent scope contract. Business reports could be queried/generated without a selected business, and reporting mutations did not consistently notify the UI.

Repair direction:

- validate report scope;
- require `scope_id` for business reporting;
- scope schedule/history queries to the selected business;
- emit reporting lifecycle events after mutations;
- retain Fleet/Enterprise reporting integration.

### Owner Command Center

A malformed JSX structure in the Owner Command Center could make buttons/controls appear broken or cause the rendered tree to fail.

Repair direction:

- preserve the canonical Owner navigation;
- keep controls as real `Link`/button actions;
- do not replace working controls with decorative cards.

### Capability surfaces

The Owner operational capability surface had become stale relative to the newer registry/catalog model.

Repair direction:

- use the canonical registry;
- show backend/service requirements;
- reconcile against live operational data;
- distinguish user-facing capabilities from raw supporting RPCs.

### Membership Preview

Tier preview buttons used product IDs such as `user_premium` where the application preview runtime expects canonical keys such as `premium`.

Repair direction:

- map every product tier ID to its canonical preview key;
- use that key for actual preview navigation;
- never accept a button as working simply because it renders.

## 4. Current Supabase production baseline

The current connected production project is:

- **Project:** `Kleenest Production`
- **Project ref:** `ssgesjzdvdsqacdtasje`
- **Status:** ACTIVE_HEALTHY
- **Postgres:** 17.x
- **Region:** us-west-2

### Canonical capability contracts currently recorded in Supabase

The `public.capability_domain_contracts` table currently contains six active canonical boundaries:

1. `bathroom_intelligence` → Bathroom intelligence → `compute_bathroom_intelligence` → platform
2. `consumer_checkins` → Consumer check-in → `kleenest_map_check_in` → consumer
3. `consumer_observations` → Consumer restroom observation → `submit_restroom_observation` → consumer
4. `consumer_reviews` → Consumer review creation → `create_review` → consumer
5. `location_discovery` → Universal location discovery → `prepare_universal_location_discovery` → platform
6. `owner_admin_crud` → Owner/Admin CRUD gateway → `admin_crud_gateway` → owner_admin

Do not assume this six-item list is the complete application feature set. It is the current **canonical domain-contract layer**.

### Current enabled feature catalog

The live `public.feature_catalog` currently contains **32 enabled feature records** spanning:

- Admin/data control
- Business workspace, analytics, intelligence, QR, QR Studio, engagement, notifications
- Community verification/photo/rating/review-vote features
- GPS and QR check-ins
- Enterprise workspace/network analytics
- Fleet workspace, operations, analytics, intelligence, maintenance, telemetry, route optimization, service opportunities, metric configuration, vehicle utilization, driver safety
- Gamification badges/challenges and business quest creation
- Advanced route planning

The database column is `minimum_tier`; do not invent or query `min_tier`.

### Current capability audit signal

`public.capability_audit_runs` is executing on a schedule. Recent runs report:

- 6 domains
- 0 domain issues
- 0 duplicate domains
- approximately 440 uncovered/uncategorized RPCs

The uncovered RPC count is **not itself proof that 440 capabilities are missing**. It means those functions are outside the current canonical capability classification and must be investigated before exposing, retiring, merging, or reclassifying them.

## 5. Current active Edge Functions observed in Supabase

The production project currently has active functions including:

- `ingest-map-candidates`
- `admin-tools`
- `maps-ingest`
- `public-data-catalog`
- `public-data-ingest`
- `public-data-ingest-v2`
- `admin-user-control`
- `public-data-ingest-v3`
- `deliver-intelligence-notification`
- `generate-intelligence-notifications`
- `backfill-location-addresses`
- `deliver-push-notification`
- `market-bathroom-ingest`
- `network-source-ingest`
- `market-bathroom-ingest-v2`
- `datagov-network-ingest-v1`
- `market-bathroom-ingest-v3`
- `market-bathroom-ingest-v4`
- `public-data-ingest-v4`
- `market-bathroom-ingest-v5`
- `ingest-map-candidates-v2`
- `ingest-map-candidates-v3`
- `stripe-create-checkout`
- `stripe-billing-webhook`
- `stripe-customer-portal`
- `run-reporting-schedules`

There are apparent versioned families (`public-data-ingest`, `market-bathroom-ingest`, `ingest-map-candidates`) that require explicit interoperability review. Do not automatically delete older versions: determine callers, responsibilities, auth behavior, data writes, and whether the variants are intentional migrations or duplicates.

## 6. Required Supabase audit procedure

Before adding substantial new functionality, and whenever an audit uncovers a deeper inconsistency, perform a full interoperability review.

### A. Inventory

For **every Supabase project accessible to the connected account**:

1. Identify project ID/name/status/region.
2. Inventory tables/views/functions/RPCs/triggers/extensions relevant to application behavior.
3. Inventory all Edge Functions and versions.
4. Record each Edge Function's `verify_jwt` behavior and intended caller.
5. Inventory capability contracts.
6. Inventory feature catalog and entitlement/tier definitions.
7. Inventory relevant scheduled jobs/audits.
8. Identify deprecated, versioned, duplicated, or similarly named objects.

### B. Capability/function classification

For every relevant RPC/function/Edge Function, classify it as one of:

- canonical user-facing capability;
- supporting implementation of a canonical capability;
- internal operational function;
- scheduled/background function;
- migration/backfill function;
- external webhook endpoint;
- deprecated/retirement candidate;
- duplicate/conflicting implementation;
- unknown — requires investigation.

Do not expose `unknown` functions as product capabilities until reviewed.

### C. Interoperability matrix

When an audit finds **inconsistency, conflict, duplication, naming drift, ownership ambiguity, tier mismatch, route mismatch, or competing implementations**, create/update an interoperability matrix.

Each matrix must include at minimum:

| Field | Required content |
|---|---|
| Capability | Canonical human-facing capability name |
| Domain | Supabase/domain boundary |
| UI surfaces | Every page/dashboard/control center exposing it |
| Routes | Canonical and legacy routes |
| Buttons/actions | Exact actionable controls and handlers |
| Service | Frontend service/module used |
| RPC/function | Exact Supabase RPC/function/Edge Function |
| Data | Tables/views written/read |
| Entitlement | Membership/tier requirement |
| Auth | Required identity/role/auth mode |
| Owner | Responsible subsystem/surface |
| Alternatives | Competing implementations |
| Conflict | What is inconsistent or duplicated |
| Resolution | Keep/merge/rename/retire/rewire |
| Verification | UI + backend test/verification performed |
| Status | Open / Investigating / Resolved / Accepted exception |

### D. Deep-conflict rule

If the matrix uncovers a deeper conflict, **stop extending the affected capability until the conflict is resolved or explicitly documented as an accepted exception**.

Examples:

- two RPCs claim to be canonical for one capability;
- two Edge Functions perform the same ingestion job;
- UI exposes a feature at a tier not enabled by `feature_catalog`;
- a button routes to a surface that cannot execute the backend capability;
- an Edge Function's auth mode contradicts its caller;
- a dashboard shows a capability but no authoritative backend path exists;
- a backend capability exists but no intended UI surface exists;
- versioned functions have overlapping writes with different behavior;
- product tier IDs and runtime preview keys diverge;
- duplicate routes expose different implementations.

## 7. UI-to-Supabase acceptance matrix

For every capability claimed as implemented, verify all of the following:

| Layer | Acceptance check |
|---|---|
| Supabase | Authoritative function/data path exists and is understood |
| Auth | Caller can legitimately invoke it |
| Entitlement | Correct membership/tier grants access |
| Service | Frontend calls the intended backend path |
| Route | User can reach the correct page |
| Dashboard | Capability appears in the correct control center |
| Button | Button is actionable and handler is wired |
| Behavior | Action actually succeeds against live backend |
| Feedback | UI reports success/error/loading appropriately |
| State | Result is reflected in UI without stale data |
| Navigation | User can continue through the intended workflow |
| Audit | No duplicate/conflicting implementation remains |

## 8. Dashboards/control centers to verify

Future UI audits must explicitly inspect:

### Owner

- Owner Command Center
- Owner Data/CRUD
- Membership Preview
- Owner Intelligence
- Reporting
- Reporting Settings
- Reporting History
- Audit/Governance
- Operational Capabilities
- Maintenance

### Admin

- Admin control/data surfaces
- Capability Hub
- Operational capability/reconciliation surfaces
- User/access controls
- Maintenance/security controls

### Business

- Business dashboard
- Analytics
- Intelligence
- QR/QR Studio
- Engagement
- Notifications
- Campaign/event/quest-related controls

### Fleet

- Fleet dashboard
- Operations
- Routes
- Route optimization
- Maintenance
- Telemetry
- Driver safety
- Vehicle utilization
- Metrics/configuration
- Fleet intelligence
- Service opportunities

### Enterprise

- Enterprise dashboard
- Network analytics
- Enterprise workspace
- Enterprise intelligence/operational controls

### Consumer

- Home/map/discovery
- Check-in
- QR check-in
- Reviews
- Observations
- Community/verification
- Gamification/quests/challenges
- Premium/Family/Fleet/Enterprise membership presentation

## 9. Membership/tier verification

The canonical product model currently defines consumer tiers:

- Free
- Premium
- Family
- Fleet User
- Enterprise User

and business tiers:

- Business/Standard
- Business Growth
- Business Fleet
- Business Enterprise

Every tier preview must be checked for:

1. correct preview key;
2. correct workspace exposure;
3. correct enabled/locked capabilities;
4. correct feature-catalog minimum tier;
5. correct button routing;
6. correct backend authorization;
7. correct resulting UI behavior.

Do not treat a visually disabled or visually enabled button as authoritative entitlement enforcement. Entitlement must be consistent across UI and backend.

## 10. Edge Function interoperability/security audit

Supabase documentation confirms that Edge Functions with `verify_jwt=true` receive platform-level JWT verification before the handler runs. Public/webhook/service-to-service functions may intentionally use different auth patterns, but those choices must be documented and matched to the caller.

Audit every active function for:

- intended caller;
- JWT/API-key/webhook authentication model;
- `verify_jwt` setting;
- authorization performed inside the handler;
- tables/RPCs touched;
- duplicate/version relationship;
- UI/service callers;
- scheduled callers;
- whether the function should be exposed as a product capability.

Never expose a secret-key-backed capability to browser code.

## 11. Audit cadence

Run audits:

- before major feature additions;
- after substantial database/function changes;
- after adding or changing a capability contract;
- after adding/changing a feature entitlement;
- after adding an Edge Function;
- after introducing a new dashboard/control center;
- after finding a broken/stale button or route;
- after finding duplicate/versioned implementations;
- periodically on the scheduled Supabase capability audit.

The scheduled audit's `uncovered_rpc_count` should be treated as an investigation queue, not automatically as a backlog of UI features.

## 12. Definition of done for future slices

A future implementation slice is complete only when:

- code is committed to the authoritative branch;
- the affected UI surface exists;
- every new button/link has a real destination or handler;
- every new dashboard card corresponds to a real capability;
- capability/tier access is consistent;
- backend path is identified and tested;
- Supabase functions/RPCs have been checked for conflicts/duplicates;
- interoperability matrix is updated when an inconsistency is discovered;
- stale/legacy competing surfaces are either rewired, retired, or explicitly documented;
- the change can be followed end-to-end by a real user.

**Do not report “implemented” until these conditions are satisfied.**
