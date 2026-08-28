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
- UI audit tooling was added to detect actionless buttons, placeholder anchors, and likely missing static route targets.

### UI quality/audit tooling

- `scripts/ui-interaction-audit.mjs` exists for static interaction coverage checks.
- `scripts/ui-interaction-audit-report.mjs` reports buttons without actions and placeholder/dead anchors.
- `scripts/ui-route-audit.mjs` identifies likely static navigation targets without corresponding runtime files.
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
- verify every Quick Find/control in each tier preview;
- never accept a button as working simply because it renders.

## 4. Current Supabase production baseline

The current connected production project is:

- **Project:** `Kleenest Production`
- **Project ref:** `ssgesjzdvdsqacdtasje`
- **Status:** ACTIVE_HEALTHY
- **Postgres:** 17.6.1
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

The production project currently has **25 active Edge Functions** observed on 2026-08-28. The current inventory includes:

- `ingest-map-candidates` v24 — `verify_jwt=false`
- `admin-tools` v7 — `verify_jwt=true`
- `maps-ingest` v20 — `verify_jwt=true`
- `public-data-catalog` v4 — `verify_jwt=true`
- `public-data-ingest` v5 — `verify_jwt=true`
- `public-data-ingest-v2` v6 — `verify_jwt=true`
- `admin-user-control` v7 — `verify_jwt=true`
- `public-data-ingest-v3` v6 — `verify_jwt=true`
- `deliver-intelligence-notification` v3 — `verify_jwt=true`
- `generate-intelligence-notifications` v4 — `verify_jwt=true`
- `backfill-location-addresses` v4 — `verify_jwt=true`
- `deliver-push-notification` v1 — `verify_jwt=false`
- `market-bathroom-ingest` v1 — `verify_jwt=true`
- `network-source-ingest` v1 — `verify_jwt=true`
- `market-bathroom-ingest-v2` v2 — `verify_jwt=true`
- `datagov-network-ingest-v1` v2 — `verify_jwt=true`
- `market-bathroom-ingest-v3` v1 — `verify_jwt=true`
- `market-bathroom-ingest-v4` v1 — `verify_jwt=true`
- `public-data-ingest-v4` v1 — `verify_jwt=true`
- `market-bathroom-ingest-v5` v2 — `verify_jwt=true`
- `ingest-map-candidates-v2` v3 — `verify_jwt=true`
- `ingest-map-candidates-v3` v5 — `verify_jwt=false`
- `stripe-create-checkout` v1 — `verify_jwt=true`
- `stripe-billing-webhook` v2 — `verify_jwt=false`
- `stripe-customer-portal` v1 — `verify_jwt=true`
- `run-reporting-schedules` v1 — `verify_jwt=true`

There are apparent versioned families (`public-data-ingest`, `market-bathroom-ingest`, `ingest-map-candidates`) that require explicit interoperability review. Do not automatically delete older versions: determine callers, responsibilities, auth behavior, data writes, and whether the variants are intentional migrations or duplicates.

### Immediate Edge Function audit flags

The current inventory has several functions with `verify_jwt=false` that must have their caller/auth contracts explicitly documented:

- `ingest-map-candidates`
- `ingest-map-candidates-v3`
- `deliver-push-notification`
- `stripe-billing-webhook`

These are not automatically defects. They are audit flags because authentication must match the actual caller. Current Supabase guidance distinguishes user-JWT calls, service-to-service secret-key calls, publishable-key calls, and external webhooks; `verify_jwt` must be aligned with that caller contract rather than changed merely to cure a UI failure.

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

## 8. Next audit sequence

The next large audit slice is deliberately **not another feature addition**. It is interoperability verification:

1. Audit all connected Supabase projects, not only production.
2. Build the Edge Function caller/auth matrix.
3. Build the RPC/function-to-capability classification matrix.
4. Reconcile the 440 uncovered RPCs into canonical/supporting/internal/legacy/unknown buckets.
5. Resolve or matrix the versioned ingestion families before adding more ingestion behavior.
6. Reconcile Stripe functions against membership-preview and pricing UI.
7. Reconcile intelligence notification generation/delivery against notification UI.
8. Reconcile reporting scheduler against reporting settings/history UI.
9. Reconcile maps/data ingestion against the Map, discovery, and location-discovery UI.
10. Reconcile Owner/Admin CRUD functions against every Owner/Admin CRUD control.
11. Run the UI interaction and route audits.
12. Perform behavioral checks on every affected dashboard/control center.
13. Update the interoperability matrices whenever a deeper inconsistency is uncovered.
14. Only after reconciliation, continue with the next implementation slice.

## 9. Future implementation rule

Before adding a new capability:

1. Search the repository and **all connected Supabase projects** for an existing capability/function/RPC/Edge Function with the same responsibility.
2. Reuse the canonical implementation if one exists.
3. If multiple implementations exist, audit and matrix them before adding anything.
4. Add backend support and UI wiring together.
5. Add entitlement/tier exposure together.
6. Verify the complete interaction path.
7. Record the implementation and verification in the project progress log.

This document is an operating instruction for future Kleenest development, not optional documentation.
