# KleenestOS Owner Control Plane Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Owner app into an actionable KleenestOS control plane and finish with four verified standalone Android APKs.

**Architecture:** Preserve canonical Supabase authority and split Owner into focused authorization, search, people, business, economy, moderation and operations services. Rework the mobile UI around searchable entities, actionable queues and audited mutations; keep raw JSON as diagnostics only. Repair CI/build failures in all four app repos and verify final artifacts.

**Tech Stack:** Expo Router, React Native, TypeScript, Supabase/PostgreSQL/RPC/RLS, GitHub Actions, Android standalone APK workflows.

**Spec:** `docs/superpowers/specs/2026-09-04-kleenestos-owner-control-plane-design.md`

## Global Constraints

- No service-role credentials in any mobile app.
- No client-side bypass of server authorization.
- Platform-owner-only mutations remain server-authorized.
- Human-readable entity search precedes UUID fallback.
- No fake controls: a visible mutation action must call real canonical authority.
- Successful mutations must refresh authoritative state.
- All material mutations require/reuse audit logging.
- Final completion requires four verified APK artifacts.

---

### Task 1: Owner authorization and capability session

**Files:**
- Create: `src/services/ownerAuthorization.ts`
- Modify: `src/services/controlPlane.ts`
- Modify: `app/auth.tsx`
- Test: `scripts/kleenestos-authority-audit.mjs`

**Interfaces:**
- Produces `getOwnerAuthorization(): Promise<{authorized:boolean; role:string|null; is_admin:boolean; is_platform_owner:boolean; tier:'platform_owner'|'admin'|'none'}>`.
- Produces `requirePlatformOwner()` for mutation service guards.

- [ ] Write audit requiring `admin_authorization_v1`, explicit authorization tier and platform-owner gating.
- [ ] Implement service wrapper and compatibility exports.
- [ ] Make sign-in route verify server authorization and preserve admin-vs-owner distinction.
- [ ] Run typecheck/audit.

### Task 2: Human-readable people and business search

**Files:**
- Create: `src/services/ownerSearch.ts`
- Create: `src/services/ownerPeople.ts`
- Create: `src/services/ownerBusinesses.ts`
- Modify: `app/access.tsx`
- Create: `app/businesses.tsx`

**Interfaces:**
- `searchOwnerUsers(query:string)` uses canonical admin search authority.
- `setOwnerUserAccess(...)` delegates to `admin_set_user_access` / `admin_set_account_capabilities` as appropriate.
- `searchOwnerBusinesses(query:string)` uses canonical business tables/RPC-safe reads available to authenticated owner.
- `setOwnerBusinessAccess(...)` delegates to `admin_set_business_access`.

- [ ] Add failing audit for search-first UX and real mutation calls.
- [ ] Implement services.
- [ ] Replace UUID-first access screen with user search, selectable account cards and audited actions.
- [ ] Add business search/control screen with member/tier/Fleet/Enterprise controls.
- [ ] Verify mutations are disabled for non-platform-owner sessions.

### Task 3: Economy operating surface

**Files:**
- Create: `src/services/ownerEconomy.ts`
- Rewrite: `app/progression.tsx`

**Interfaces:**
- `getOwnerEconomySnapshot()` reads live canonical progression/discovery tables/RPCs only.
- Returns XP totals/velocity/action mix/evidence mix/level distribution/objective counts/recent high-value events/anomaly candidates.

- [ ] Add audit requiring live canonical data sources and no static metrics.
- [ ] Implement aggregate queries/RPC calls with per-section fallbacks.
- [ ] Render economy pulse, XP flow, evidence tiers, levels, specialties, objectives, campaigns/contests, recent high-value events and anomaly candidates.
- [ ] Keep diagnostics collapsible.

### Task 4: Moderation and trust command queues

**Files:**
- Create: `src/services/ownerModeration.ts`
- Create: `app/moderation.tsx`
- Modify: `app/index.tsx`

**Interfaces:**
- `getOwnerModerationQueues()` returns pending review reports, pending businesses/claims and other supported trust queues.
- `resolveOwnerReviewReport(...)` delegates to canonical moderation RPC.

- [ ] Add audit for actionable moderation queue and mutation.
- [ ] Implement queue service and screen.
- [ ] Link pending/critical cards from home.
- [ ] Verify successful mutation refresh.

### Task 5: Operations control plane

**Files:**
- Create: `src/services/ownerOperations.ts`
- Rewrite: `app/operations.tsx`

**Interfaces:**
- `getOwnerOperationsSnapshot()` wraps live overview, integrity, ingestion, push, resources and activity.
- `setIngestionResumeAuthorization(authorized:boolean)` delegates to `admin_set_national_ingestion_resume_authorization`.

- [ ] Add audit requiring live ingestion action and health sections.
- [ ] Implement service and actionable operations UI.
- [ ] Require explicit confirmation copy before ingestion resume mutation.
- [ ] Refresh authoritative state after actions.

### Task 6: KleenestOS Command Center and navigation

**Files:**
- Create: `src/components/KleenestOS.tsx`
- Rewrite: `app/index.tsx`
- Modify: `app/_layout.tsx`

**Interfaces:**
- Home composes authorization, platform health, moderation, economy, ingestion and recent mutation summaries.

- [ ] Add audit for Command Center sections and routes.
- [ ] Build reusable OS components.
- [ ] Replace JSON-first home with actionable cards and quick search/actions.
- [ ] Keep System diagnostics routes reachable but secondary.

### Task 7: Owner backend authority gaps

**Files:**
- Supabase migration(s) only if inspection proves a required owner action lacks safe canonical RPC authority.

- [ ] Inspect each visible Owner mutation against existing RPC authorization.
- [ ] If a gap exists, add minimum security-definer owner-only RPC with audit write and authenticated EXECUTE grant.
- [ ] Verify platform owner succeeds and ordinary admin is denied for owner-only mutations.

### Task 8: Owner CI and APK certification

**Files:**
- Modify: Owner audit scripts/workflows only when failing evidence identifies root cause.

- [ ] Run Owner CI/typecheck/audit.
- [ ] Diagnose every failing step from logs; fix root cause one at a time.
- [ ] Run standalone APK workflow.
- [ ] Require candidate/build verification and promoted artifact success.

### Task 9: Consumer CI/build convergence

- [ ] Inspect latest Consumer CI and standalone workflows.
- [ ] Fix stale audits/runtime failures without weakening intended product contracts.
- [ ] Verify CI success.
- [ ] Verify standalone APK artifact success.

### Task 10: Business CI/build convergence

- [ ] Inspect latest Business CI and standalone workflows.
- [ ] Diagnose/fix any failure.
- [ ] Verify CI and APK artifact success.

### Task 11: Fleet CI/build convergence

- [ ] Inspect latest Fleet CI and standalone workflows.
- [ ] Diagnose/fix any failure.
- [ ] Verify CI and APK artifact success.

### Task 12: Four-artifact delivery verification

- [ ] Fetch final successful workflow artifacts for Consumer, Business, Fleet and Owner.
- [ ] Download ZIPs, extract APKs to `/mnt/data`.
- [ ] Compute SHA-256 and verify non-zero APK files.
- [ ] Deliver four sandbox install links only after all verification evidence is fresh.
