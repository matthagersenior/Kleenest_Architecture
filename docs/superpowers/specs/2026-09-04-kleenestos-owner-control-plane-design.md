# KleenestOS Owner Control Plane Design

**Date:** 2026-09-04

## Purpose

Kleenest Owner becomes **KleenestOS**: the private platform operating system for the entire Kleenest economy. It must not behave like a passive analytics dashboard. A verified platform owner must be able to discover entities, inspect state, take audited actions, resolve incidents, govern the progression economy, manage access, oversee businesses and locations, moderate trust signals, control ingestion, and understand system health from one coherent command surface.

## Product principles

1. **Actionable, not decorative.** Every important status surface should lead to the entity, incident, queue, or command that resolves it.
2. **Platform-owner authority is explicit.** The UI shows whether the current session is platform-owner authorized and which action families are available.
3. **Search before UUIDs.** Users, businesses, locations and resources are searchable by human-readable identity. Raw UUID entry exists only as an advanced fallback.
4. **One control plane.** Owner invokes canonical server-authoritative RPCs/tables already used by Consumer, Business, Fleet and Enterprise; it does not create parallel authority.
5. **Audit everything.** Mutations require reasons where material, write audit history, expose before/after state when available, and fail closed.
6. **Economy is a first-class operating domain.** XP issuance, levels, specialties, quests, missions, challenges, journeys, campaigns, contests, badges, rankings and suspicious reward activity are operational controls, not just charts.
7. **No raw JSON as primary UX.** JSON is an expandable diagnostic view only.
8. **Mobile-first command center.** The Android Owner app must remain usable on a phone, with searchable entity lists, cards, queues, filters and clear action buttons.

## Information architecture

### 1. Command Center

The home route is a live operating summary with actionable sections:

- current owner authorization state;
- critical/warning/healthy platform health;
- ingestion state and storage guard;
- pending businesses and claims;
- unresolved moderation/review reports;
- push/native notification health;
- discovery/evidence/XP economy pulse;
- active campaigns/contests/objectives;
- recent control-plane mutations;
- quick actions and search.

Each card links to the relevant operating domain or entity.

### 2. People & Access

Search users by display name, username, email-equivalent profile identity where available, or UUID. Expose current role, admin status, platform-owner status, subscription tier, business-user status and relevant memberships.

Platform-owner actions:

- grant/revoke admin access;
- change account role within canonical enum;
- change subscription tier;
- set business-user flag;
- assign/remove business memberships;
- inspect account capability history.

Owner self-protection rules remain server-side. Ordinary admins are not treated as platform owners for owner-only mutations.

### 3. Businesses & Network

Search businesses by name or ID and inspect canonical locations, owners/members, verification, tier, Fleet and Enterprise entitlements, claims and unresolved network state.

Actions:

- set business tier;
- enable/disable Fleet and Enterprise entitlements through canonical access authority;
- assign/remove members;
- verify/unverify business where canonical authority exists;
- resolve location claims;
- open linked locations and network state.

### 4. Economy

The economy view exposes:

- total XP issued;
- XP issuance velocity;
- XP by action/evidence tier/specialty;
- global level distribution;
- specialty progression distribution;
- active/completed objective counts by type;
- campaign and contest state;
- badge issuance;
- ranking participation;
- suspicious reward velocity/idempotency anomalies;
- recent high-value progression events.

Controls should use existing canonical configuration/definition tables and RPCs where mutable authority already exists. Where no safe mutation authority exists, Owner exposes inspection and explicitly marks the control as unavailable rather than presenting a fake button.

### 5. Trust & Moderation

Queues and searchable entities for:

- review reports;
- evidence/discovery conflicts;
- stale/disputed locations;
- remediation cases;
- business verification state;
- location claims.

Actions use existing moderation/claim/remediation RPC authority and record reasons.

### 6. Operations

Operational controls and diagnostics for:

- national ingestion status;
- ingestion resume authorization;
- data integrity;
- push delivery and native push health;
- reporting runs;
- backend resource catalog;
- recent activity events.

Operational controls that can alter ingestion or platform behavior require explicit reason/confirmation in UI and server-side owner authorization.

### 7. System

Advanced platform governance:

- capability catalog;
- CRUD capability catalog;
- raw schema audit;
- capability retirement audit;
- single-capability-per-domain issues;
- audited data workbench through `admin_crud_gateway` only.

This remains advanced/diagnostic and is not the default home experience.

## Authorization model

`signInOwner` may authenticate an administrator for read-only administrative surfaces, but the app must separately fetch `admin_authorization_v1()` and distinguish:

- `platform_owner`: may invoke platform-owner mutations;
- `admin`: may use admin-safe moderation/inspection calls only;
- unauthorized: signed out.

Every mutation button is gated by actual authority returned from the backend. The UI never assumes permissions from local navigation state.

## Data/service boundaries

Add focused service modules rather than expanding one monolithic file:

- `src/services/ownerAuthorization.ts`
- `src/services/ownerSearch.ts`
- `src/services/ownerPeople.ts`
- `src/services/ownerBusinesses.ts`
- `src/services/ownerEconomy.ts`
- `src/services/ownerModeration.ts`
- `src/services/ownerOperations.ts`

Existing `controlPlane.ts` may retain compatibility exports but delegates new work to focused modules.

## UI architecture

KleenestOS uses a reusable command-surface component library:

- `OSHero`
- `HealthCard`
- `EntitySearch`
- `EntityRow`
- `ActionSheetCard`
- `StatusPill`
- `SectionHeader`
- `AuditTrailCard`
- `DiagnosticDisclosure`

Primary screens use human-readable cards/lists. JSON diagnostic payloads are collapsed by default.

## Error handling

- Authentication failures route to Owner sign-in.
- Permission failures show the denied capability and current authorization tier.
- Mutation errors preserve form state and never optimistically pretend success.
- Successful mutations refresh the authoritative server state and surface the audit result.
- Partial dashboard failures degrade per section instead of blanking the entire command center.

## Verification

Completion requires:

1. Platform-owner authorization is shown and mutation controls are actually enabled for an authorized owner.
2. User search returns human-readable accounts and allows a safe account-access mutation through canonical RPC authority.
3. Business search returns human-readable businesses and allows tier/Fleet/Enterprise changes through canonical authority.
4. Moderation queue can resolve a real pending report path when data exists.
5. Ingestion control can inspect current state and invoke the existing owner-only resume authorization path.
6. Economy view reads live discovery/progression data and contains no fabricated metrics.
7. Command Center links to actionable queues/entities rather than static JSON dumps.
8. Existing capability/system diagnostics remain reachable under System.
9. CI audit asserts all above service and UI contracts.
10. Owner Android typecheck, audit, bundle preflight and standalone APK workflow pass.
11. Consumer, Business and Fleet CI/builds are also brought green and final standalone APK artifacts are produced for all four apps.

## Non-goals

- No service-role key in the mobile app.
- No bypass of RLS or server authorization.
- No fake economy controls when no canonical server mutation exists.
- No replacement of canonical Consumer/Business/Fleet/Enterprise data models.
