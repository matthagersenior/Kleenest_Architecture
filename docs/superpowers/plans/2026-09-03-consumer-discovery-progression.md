# Consumer Discovery + Progression Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make place discovery/contribution and a deep XP/objective system first-class Kleenest consumer capabilities while preserving canonical location, evidence and historical progression authority.

**Architecture:** Converge existing location discovery, evidence, badges, quests, contests and progression onto one canonical contribution/progression event path. Add remote and on-site discovery as distinct evidence strengths; one authoritative progression event fans out idempotently to global XP, specialty XP, objectives, badges, campaigns, contests and ranking projections.

**Tech Stack:** React 19, React Router, Vite, Supabase/PostgreSQL/RPC/RLS, existing Kleenest canonical location/evidence/progression services.

**Spec:** `docs/superpowers/specs/2026-09-03-consumer-discovery-progression-design.md`

## Global Constraints

- Remote discovery is allowed; physical presence is not required to create a candidate.
- On-site live GPS evidence MUST receive greater evidence strength and XP than an otherwise equivalent remote assertion.
- Preserve one canonical location identity and run duplicate matching before canonical creation.
- Preserve field-level provenance, confidence, freshness and contradiction state.
- Preserve historical earned badges/achievements during convergence.
- Use one authoritative progression event stream; do not create separate XP ledgers for objective types.
- Sponsored rewards never grant verification authority.
- Public rankings never expose precise private location history.
- Existing check-in/review/evidence flows must continue working and converge into the new progression path.

---

### Task 1: Discovery and progression contract audit

**Files:**
- Create: `scripts/consumer-discovery-progression-audit.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: existing canonical location, evidence, progression, badge, quest, contest and campaign contracts.
- Produces: executable audit `npm run audit:consumer-discovery-progression` that fails until every required contract/surface is present.

- [ ] **Step 1: Write the failing audit**

Create an audit that checks for: remote discovery RPC/service, on-site evidence method, duplicate matching, discovery contribution surface, canonical progression event award RPC, specialty levels, objective types `quest|mission|challenge|journey|contest|campaign`, progress overview service, rankings, and Explore `Add / Discover a Place` entry.

- [ ] **Step 2: Register and run it**

Add `"audit:consumer-discovery-progression":"node scripts/consumer-discovery-progression-audit.mjs"` to `package.json` and run it. Expected: FAIL listing missing convergence contracts.

- [ ] **Step 3: Commit the red audit**

```bash
git add package.json scripts/consumer-discovery-progression-audit.mjs
git commit -m "test: define consumer discovery progression contract"
```

### Task 2: Canonical discovery authority

**Files:**
- Create: `supabase/migrations/20260904030000_consumer_discovery_authority_v1.sql`
- Modify: canonical location/discovery service file identified by Task 1 audit
- Test: `scripts/consumer-discovery-progression-audit.mjs`

**Interfaces:**
- Produces RPC `consumer_match_or_create_discovery(p_input jsonb) returns jsonb`.
- Input contains `method`, `name`, `address`, `latitude`, `longitude`, `external_source`, `external_id`, and optional evidence metadata.
- Output contains `location_id`, `matched_existing`, `discovery_state`, `evidence_tier`, `confidence`, and duplicate candidates when creation is unsafe.

- [ ] **Step 1: Extend audit to require exact RPC/service names and discovery states**
- [ ] **Step 2: Run audit and verify failure**
- [ ] **Step 3: Add migration with authenticated grants/RLS-safe RPC**

The RPC must normalize identity/address, perform coordinate/source/identity duplicate checks, return probable duplicates instead of blindly inserting, and establish `candidate|located|documented|on_site_observed|community_confirmed|verified|stale|disputed` state metadata using existing canonical tables wherever possible.

- [ ] **Step 4: Add service wrapper with typed normalized result and actionable errors**
- [ ] **Step 5: Run audit and existing location interoperability/map discovery audits**
- [ ] **Step 6: Commit**

```bash
git add supabase/migrations src package.json scripts
git commit -m "feat: add canonical consumer place discovery authority"
```

### Task 3: Structured discovery evidence and amenity enrichment

**Files:**
- Create: `supabase/migrations/20260904031500_discovery_evidence_enrichment_v1.sql`
- Modify: existing evidence/amenity canonical service(s)
- Test: discovery/progression audit plus existing freshness-confidence audit

**Interfaces:**
- Produces RPC `consumer_record_discovery_evidence(p_location_id uuid, p_input jsonb) returns jsonb`.
- Evidence input supports source method, captured coordinates/time, photo references, restroom access, amenities, quantities, accessibility, hours/access notes and corrections.

- [ ] **Step 1: Add failing audit assertions for evidence provenance and amenity enrichment**
- [ ] **Step 2: Implement evidence RPC using existing observation/amenity authority instead of parallel tables**
- [ ] **Step 3: Compute evidence tier from remote/corroborated/GPS/on-site/independent-confirmation facts server-side; never trust a client-supplied XP tier**
- [ ] **Step 4: Ensure self-confirmation cannot satisfy independent confirmation**
- [ ] **Step 5: Run audits and commit**

```bash
git add supabase/migrations src scripts
git commit -m "feat: enrich discoveries with canonical restroom evidence"
```

### Task 4: Canonical XP ledger and evidence-weighted awards

**Files:**
- Create: `supabase/migrations/20260904033000_progression_event_engine_v2.sql`
- Modify: existing progression service(s)
- Test: progression audit and trust-fleet-progression audit

**Interfaces:**
- Produces RPC `record_progression_event_v2(p_action text, p_subject jsonb, p_idempotency_key text) returns jsonb`.
- Returns `event_id`, `base_xp`, `multipliers`, `xp_awarded`, `global_level`, `specialty_updates`, `objective_updates`, `badge_updates`.

- [ ] **Step 1: Add failing assertions that on-site equivalent > remote equivalent and duplicate idempotency keys award zero additional XP**
- [ ] **Step 2: Add data-driven action/XP configuration and canonical event ledger migration, reusing existing progression tables where compatible**
- [ ] **Step 3: Implement server-side award calculation using novelty, evidence strength, completeness, freshness, verification and usefulness multipliers**
- [ ] **Step 4: Add cooldown/diminishing-return hooks and reversal/withholding state for invalid contributions**
- [ ] **Step 5: Route existing check-in/review/evidence progression calls through v2 compatibility wrappers**
- [ ] **Step 6: Run progression and legacy audits; commit**

```bash
git add supabase/migrations src scripts
git commit -m "feat: converge evidence weighted XP engine"
```

### Task 5: Global and specialty level system

**Files:**
- Create: `supabase/migrations/20260904034500_progression_levels_specialties_v1.sql`
- Modify: progression service

**Interfaces:**
- Produces `consumer_progression_overview()` with global level/title, lifetime XP, current-level XP, next threshold/unlock, percentage, streak and specialties.
- Specialty keys: `explorer`, `verifier`, `accessibility_scout`, `restroom_mapper`, `photographer`, `reviewer`, `community_contributor`, `pathfinder`.

- [ ] **Step 1: Add failing level/specialty audit assertions**
- [ ] **Step 2: Add data-driven global level and specialty threshold definitions**
- [ ] **Step 3: Project canonical progression events into specialty XP idempotently**
- [ ] **Step 4: Implement overview RPC/service and XP ledger explanations**
- [ ] **Step 5: Run audits and commit**

```bash
git add supabase/migrations src scripts
git commit -m "feat: add deep global and specialty leveling"
```

### Task 6: Unified objective engine

**Files:**
- Create: `supabase/migrations/20260904040000_progression_objectives_v1.sql`
- Modify: existing quest/contest/campaign services rather than creating competing authorities

**Interfaces:**
- Objective kinds: `quest`, `mission`, `challenge`, `journey`, `contest`, `campaign`.
- Produces `consumer_active_objectives()` and canonical event dispatcher integration.

- [ ] **Step 1: Add failing audit for all six objective kinds, prerequisites, steps, windows and rewards**
- [ ] **Step 2: Add/extend objective definition and user-progress structures with ordered/unordered steps, prerequisites, target counts, time windows and completion state**
- [ ] **Step 3: Migrate/adapt existing Trust Quest progress to objective projection without deleting history**
- [ ] **Step 4: Connect missions/challenges/journey chapters to the same event dispatcher**
- [ ] **Step 5: Adapt contests to explicit scoring/eligibility/tie rules and campaigns to orchestrate child objectives**
- [ ] **Step 6: Verify one event can advance multiple eligible objectives exactly once**
- [ ] **Step 7: Run audits and commit**

```bash
git add supabase/migrations src scripts
git commit -m "feat: unify quests missions challenges journeys and campaigns"
```

### Task 7: Badge convergence and historical preservation

**Files:**
- Create: `supabase/migrations/20260904041500_badge_progress_projection_v1.sql`
- Modify: `src/runtime/BadgeCatalogPanel.jsx`
- Modify: existing badge service

**Interfaces:**
- Badge catalog returns `earned|in_progress|locked`, progress numerator/denominator and historical-earned preservation.

- [ ] **Step 1: Add failing assertions for earned/in-progress/locked states and historical recognition**
- [ ] **Step 2: Extend existing comprehensive badge catalog rather than replacing it**
- [ ] **Step 3: Project progress from canonical events/aggregates**
- [ ] **Step 4: Update BadgeCatalogPanel to expose understandable progress**
- [ ] **Step 5: Run badge/progression audits and commit**

```bash
git add supabase/migrations src/runtime src scripts
git commit -m "feat: converge badge collection with canonical progression"
```

### Task 8: Rankings and privacy-safe leaderboards

**Files:**
- Create: `supabase/migrations/20260904043000_progression_rankings_v1.sql`
- Modify: existing leaderboard service/surface

**Interfaces:**
- Produces `consumer_progression_rankings(p_scope text, p_metric text, p_context jsonb)`.
- Supported scopes: global, following, local, city, state, national, business/location, campaign, contest, specialty.

- [ ] **Step 1: Add failing scope/metric/privacy assertions**
- [ ] **Step 2: Implement quality-qualified ranking projection from canonical progression data**
- [ ] **Step 3: Ensure local/geographic rankings return rank/region labels but never another user's precise contribution coordinates/history**
- [ ] **Step 4: Wire existing leaderboard surface to canonical ranking service**
- [ ] **Step 5: Run audits and commit**

```bash
git add supabase/migrations src scripts
git commit -m "feat: add privacy safe progression rankings"
```

### Task 9: Consumer Discover / Contribute experience

**Files:**
- Create: focused runtime component/page files following existing consumer runtime conventions
- Modify: canonical consumer routes/navigation
- Modify: map/search surface

**Interfaces:**
- Consumes Task 2 discovery matching and Task 3 evidence recording.
- Produces guided modes: `gps`, `map_pin`, `address`, `place_search`, `remote`, with photo/evidence enrichment.

- [ ] **Step 1: Add failing route/surface audit for Discover entry and all discovery methods**
- [ ] **Step 2: Add prominent `Add / Discover a Place` action to Explore, including sparse/empty-results invitation**
- [ ] **Step 3: Build method chooser and duplicate-match step before creation**
- [ ] **Step 4: Build progressive identity/restroom/amenity/photo enrichment steps with save/resume-friendly mutations**
- [ ] **Step 5: Show evidence-strength explanation (`Remote`, `GPS-supported`, `On-site live`, etc.) without allowing the user to select their own trust tier**
- [ ] **Step 6: On successful contribution, render awarded XP and any objective/badge progress returned by the canonical engine**
- [ ] **Step 7: Verify mobile layout and run audits/build; commit**

```bash
git add src scripts
git commit -m "feat: make place discovery a first class consumer journey"
```

### Task 10: Expansive Progress destination

**Files:**
- Create/modify: focused Progress page/components following existing runtime patterns
- Modify: consumer navigation/routes
- Reuse: `src/runtime/BadgeCatalogPanel.jsx`

**Interfaces:**
- Consumes progression overview, active objectives, badges, rankings and XP ledger.

- [ ] **Step 1: Add failing surface audit for every required section**
- [ ] **Step 2: Render global level card with XP-to-next-level and next unlock**
- [ ] **Step 3: Render specialty level collection**
- [ ] **Step 4: Render active quest, missions, daily/weekly/monthly challenges and current journey chapter**
- [ ] **Step 5: Render campaigns, contests and rankings**
- [ ] **Step 6: Render badge collection/in-progress badges, streak, recent achievements and detailed XP history**
- [ ] **Step 7: Ensure loading/error/empty states are distinct and useful**
- [ ] **Step 8: Run audits/build and commit**

```bash
git add src scripts
git commit -m "feat: expose expansive consumer progression experience"
```

### Task 11: Nearby progression opportunity recommendations

**Files:**
- Create: `supabase/migrations/20260904044500_progression_opportunities_v1.sql`
- Modify: Explore and Progress services/surfaces

**Interfaces:**
- Produces `consumer_nearby_progression_opportunities(p_lat double precision, p_lon double precision, p_radius_m integer)`.
- Opportunity kinds include missing restroom intelligence, stale verification, missing photo, incomplete amenity inventory, objective target and campaign target.

- [ ] **Step 1: Add failing opportunity audit**
- [ ] **Step 2: Implement privacy-safe opportunity query combining location gaps/freshness with active objectives**
- [ ] **Step 3: Surface `What can I do nearby?` on Progress and contextual opportunities on Explore/details**
- [ ] **Step 4: Deep-link each recommendation to the correct canonical contribution action**
- [ ] **Step 5: Run audits and commit**

```bash
git add supabase/migrations src scripts
git commit -m "feat: recommend nearby useful progression actions"
```

### Task 12: End-to-end convergence, anti-gaming and certification

**Files:**
- Modify: `scripts/consumer-discovery-progression-audit.mjs`
- Modify: relevant existing audit runner/capability matrices
- Modify: architecture docs if exact runtime paths changed during implementation

**Interfaces:**
- Produces a green end-to-end certification for discovery → evidence → progression → objectives → UI.

- [ ] **Step 1: Add final audit cases for remote discovery, GPS discovery, on-site XP superiority, duplicate rejection, self-confirmation rejection, idempotent XP and historical badge preservation**
- [ ] **Step 2: Add regression checks that existing review/check-in/map/details flows still work**
- [ ] **Step 3: Run `npm run build`, the new audit, `audit:map-discovery`, `audit:freshness-confidence`, `audit:location-interoperability`, `audit:trust-fleet-progression`, and the full audit runner**
- [ ] **Step 4: Fix every failure at root cause and rerun until green**
- [ ] **Step 5: Update interoperability matrix from Partial to the actually demonstrated state only**
- [ ] **Step 6: Commit certification**

```bash
git add .
git commit -m "test: certify consumer discovery progression convergence"
```

## Self-review

- Spec coverage: all twelve acceptance criteria map to Tasks 2–12.
- Existing badge/quest/contest/campaign systems are converged, not discarded.
- Remote and on-site discovery are explicitly distinct and server-evaluated.
- The plan does not introduce a second canonical location identity or a second XP ledger.
- Progression surfaces include XP, levels, specialties, quests, missions, challenges, journeys, contests, campaigns, badges and rankings.
- Anti-gaming and privacy requirements are testable rather than aspirational.
