# Kleenest — Interoperability Matrix & Integration Audit — 2026-08-28

## Authority

Current repository: `matthagersenior/Kleenest_Architecture/main`

Canonical acceptance path:

`Production Supabase authority → auth/RLS → canonical service → AppContext/runtime → workspace navigation → canonical surface → actionable control → authoritative mutation/query → state refresh → telemetry → offline/realtime behavior`

A route, component, RPC, service, or capability record is not considered implemented until the complete path is proven.

## Audit basis

This update reconciles:

- the 2026-08-28 large-slice repair program;
- the existing 2026-08-27 interoperability matrix;
- the independent interoperability/product review;
- the current `main` branch commit history through `b1c16a6473207637f8f1b727ad1fe6723992b9fa`;
- recent route, evidence, business, intelligence, capability-catalog, and production-contract hardening work.

The latest branch activity confirms substantial progress in authoritative routing, route-stop persistence/recovery, canonical evidence handling, business notifications/QR/geofence, intelligence convergence, and live capability evidence. The remaining risk is therefore increasingly **integration completeness and product activation**, not lack of backend breadth.

## Current-state audit

### Overall assessment

| Area | Current state | Confidence | Priority |
|---|---|---:|---:|
| Canonical architecture | Strong | High | Maintain |
| Maps/location identity | Stronging/hardened, still foundational | High | P0 |
| Consumer evidence loop | Substantially implemented; propagation/activation still needs proof | High | P0 |
| Routing | Significantly hardened; persistence/recovery and authoritative stops now explicit | High | P0 |
| Progression/quests | Wired to evidence; requires end-to-end activation verification | Medium-High | P1 |
| Business | Broad and increasingly canonical; needs operator-loop consolidation | High | P1 |
| Fleet | Strong backend/domain breadth; surface completeness remains secondary to named demand | Medium | P2 |
| Enterprise | Architecturally coherent; demand-gated surface expansion recommended | Medium | P2 |
| Intelligence | Strong convergence and action/outcome contracts; candidate for AI augmentation | High | P1 |
| Notifications/live network | Canonical service and business outcomes exist; delivery/realtime verification remains important | Medium-High | P1 |
| Capability catalog | Live-evidence direction is correct; must remain distinct from product capability presentation | High | P1 |
| Governance/moderation | Control-plane architecture exists; minimum UGC moderation should precede scale | Medium | P1 |
| UX/navigation | Improving, but route aliases and dense multi-purpose surfaces remain | High | P1 |
| Activation/distribution | Biggest business risk | High | P0 |

## Confirmed recent progress

### Consumer evidence

Recent commits show the consumer evidence system moved from isolated UI wiring toward authoritative trust-loop behavior, including canonical evidence services, live reputation feedback, quest dispatch, evidence deduplication, server-authoritative verification distance, and removal of duplicate client-side progression.

### Routing

Recent commits show a concentrated hardening sequence: canonical route-stop validation, authoritative stop IDs, verified check-in → route-stop arrival, persisted route authority, active-route recovery, and current route-cache recovery. This materially improves the route interoperability chain.

### Business

Recent work includes canonical business CRUD restoration, removal of a duplicate business service, business notification outcomes, inbox refresh, QR Studio exposure/routing, geofence configuration, partner program workflows, and intelligence convergence across business/fleet outcomes.

### Intelligence

Recent work includes canonical intelligence outcome chains, reporting integration, live recommendations, owner intelligence lab wiring, actionable fleet intelligence, and prevention of duplicate intelligence refresh loops.

## Critical remaining integration risks

### 1. Map → place → evidence → intelligence propagation

The consumer loop is structurally present, but the audit standard must now prove that a single contribution changes the next authoritative read model, map/place state, progression, Community visibility, and telemetry where applicable.

### 2. Location identity conflicts

Continue eliminating parallel identity concepts such as place/location normalization and duplicated stores such as favorites/follows variants. These are higher-risk than cosmetic defects because they can produce divergent read models.

### 3. Route state and discovery state must converge

Route persistence is now substantially hardened. The next proof is that a route created from canonical map/place data survives refresh/auth transitions and still references the same authoritative locations, evidence context, and route-stop identities.

### 4. Business feature breadth vs operator usability

Campaigns, promotions, events, contests, QR, geofence, notifications, analytics, and intelligence are increasingly wired. The next goal is one coherent Business operating loop, not more isolated screens.

### 5. Capability inventory vs product capability

The capability catalog must continue separating infrastructure/RPC inventory from user-facing capabilities. Unknown or implementation-only functions must never become product features merely because they exist in the backend.

### 6. Activation remains the highest commercial risk

The architecture is substantially ahead of demonstrated consumer activity. The next large slices should increase local map usefulness, shorten first-use time, and prove the contribution loop with real activity before expanding speculative enterprise depth.

### 7. Moderation is a scale prerequisite

As soon as public evidence/reviews become active, minimum moderation must exist: report, review, queue, resolve/remove, audit. AI can assist moderation later but must not become the sole authority for irreversible removal.

## Updated interoperability matrix

Legend: `●` hard dependency; `○` meaningful/optional coupling; `△` planned AI augmentation; `—` limited coupling.

| Domain ↓ / Depends on → | Maps / Location | Auth / RLS | Evidence | Progression | Business | Fleet | Enterprise | Notifications | Intelligence | Admin/Governance |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Consumer Discovery | ● | ● | ○ | ○ | ○ | — | — | ○ | ○ | — |
| Consumer Evidence | ● | ● | — | ● | ○ | — | — | ○ | ● | ○ |
| Routing | ● | ● | ○ | ○ | ○ | ○ | ○ | ○ | ○ | — |
| Progression / Quests | ○ | ● | ● | — | ○ | ○ | ○ | ○ | ○ | — |
| Business | ● | ● | ○ | ○ | — | ○ | ○ | ● | ● | ○ |
| Fleet | ● | ● | — | ○ | ○ | — | ● | ● | ● | ○ |
| Enterprise | ● | ● | ○ | ○ | ● | ● | — | ● | ● | ○ |
| Notifications / Live | ○ | ● | ○ | ○ | ● | ● | ● | — | ● | ○ |
| Intelligence | ● | ● | ● | ● | ● | ● | ● | ○ | — | ● |
| Admin / Governance | ○ | ● | ● | ○ | ● | ● | ● | ○ | ● | — |
| AI augmentation | ● | ● | ● | ○ | ● | ● | ● | ● | ● | ● |

### Interpretation

1. **Maps/Location and Auth/RLS remain the widest blast-radius dependencies.**
2. **Evidence is the main consumer-side data-generation dependency.**
3. **Intelligence is now a fan-in layer rather than a standalone feature area.**
4. **AI should be an augmentation layer over authoritative facts, not a new authority.**
5. **Business, Fleet, and Enterprise should consume shared canonical facts rather than maintain parallel metrics engines.**

## Large-slice integration plan

### Slice 1 — Map/Location Authority Closure

**Goal:** make discovery, place identity, routing, evidence, and intelligence use the same canonical location identity.

Batch together:

- canonical discovery and fallback behavior;
- place/detail lookup;
- source/provenance identity;
- duplicate/merge conflict handling;
- map marker/detail continuity;
- route-stop identity validation;
- freshness/confidence fields;
- favorites/saved identity reconciliation;
- location read-model refresh;
- map loading/empty/error/offline states.

**Exit gate:** one canonical location ID remains stable from map → place → route → check-in → evidence → intelligence.

### Slice 2 — Consumer Trust Loop Closure

**Goal:** prove the complete evidence propagation chain.

`map → place → verified visit → observation/photo → review → reputation → progression → Community → intelligence → map refresh`

Batch together service/RPC/UI/telemetry changes rather than fixing individual controls.

**Exit gate:** a test contribution can be traced through every authoritative downstream state and each surface refreshes without a second data model.

### Slice 3 — Route + Evidence Convergence

**Goal:** turn routing into an evidence-producing journey.

`route → canonical stop → arrival → verified check-in → evidence → stop completion → route progress → route history`

Include persisted active-route recovery, auth transitions, offline state, retry/idempotency, and map synchronization.

**Exit gate:** refresh/sign-out/sign-in/offline transitions do not lose or fork the authoritative route.

### Slice 4 — Freshness / Confidence / Reverification

**Goal:** make location intelligence time-aware.

- evidence recency decay;
- freshness score;
- confidence score;
- stale-location detection;
- reverification targets;
- verification streaks;
- map visual confidence/freshness;
- provenance/explanation.

**Exit gate:** old evidence cannot silently carry the same weight as current verified evidence.

### Slice 5 — Business Trust + Growth Loop

**Goal:** make Business consume and improve consumer intelligence.

`claim location → see evidence → respond → corrective action → consumer reverify → reputation/outcome → analytics`

Then connect QR, geofence, campaigns, promotions, contests, notifications, attribution, and intelligence recommendations.

**Exit gate:** every business recommendation terminates in an actionable operator control and measurable outcome.

### Slice 6 — Intelligence Recommendation/Action/Outcome OS

**Goal:** make every domain recommendation operational.

Canonical lifecycle:

`signal → recommendation → evidence/provenance → authorization → proposed → accepted → executing → completed/failed → outcome → notification/analytics`

**Exit gate:** no recommendation is considered complete until an outcome is recorded or an explicit failure state exists.

### Slice 7 — AI Foundation + First Production AI

**Goal:** add AI where it multiplies existing intelligence rather than inventing a second system.

First production targets:

1. natural-language restroom/location search;
2. evidence summarization and trust explanation;
3. review/observation moderation assistance;
4. multi-source conflict-resolution suggestions;
5. Business opportunity summaries;
6. Owner/Admin anomaly triage.

**Exit gate:** every AI result includes source facts, confidence/limitations, model/version metadata, and a safe fallback. AI cannot directly mutate authoritative location/reputation/entitlement state.

### Slice 8 — Notifications / Realtime / Offline Closure

**Goal:** ensure canonical state transitions reach users reliably.

- event → notification materialization → delivery → read/action;
- realtime subscriptions by privacy class;
- offline packs around route corridors;
- idempotent replay;
- conflict handling;
- delivery telemetry.

**Exit gate:** network loss and reconnect do not create duplicate evidence, routes, or actions.

### Slice 9 — Business/Fleet/Enterprise Shared Intelligence

**Goal:** reuse intelligence and outcomes across operating workspaces.

`canonical fact → domain-specific recommendation → authorized action → shared outcome`

No duplicate metrics engine.

**Exit gate:** shared facts remain consistent while each workspace receives its own action/read model.

### Slice 10 — Governance / Moderation / Production Certification

**Goal:** make public scale safe.

- moderation queue;
- report/remove/reinstate;
- audit trail;
- anomaly escalation;
- capability reconciliation;
- security/RLS audit;
- CI contract tests;
- end-to-end production journeys;
- deployment verification.

**Exit gate:** critical consumer/business journeys are reproducible from production authority through UI and back to telemetry.

## AI / LLM strategy

### Design principle

AI should sit **beside the intelligence layer and above canonical facts**, not beneath the source-of-truth boundary.

`canonical facts → deterministic scoring/rules → AI enrichment/ranking/explanation → recommendation/action → human or authorized workflow → measured outcome`

Never:

`LLM → direct database mutation → authoritative state`

### Highest-value AI opportunities

| AI capability | Product use | Recommended timing | Authority |
|---|---|---|---|
| Natural-language location search | “Find a clean restroom with changing table near I-64” | Early | Retrieval/ranking only |
| Evidence summarizer | Convert many observations/reviews into a concise current-place summary | Early | Explain, never invent |
| Trust explanation | Explain why a location is high/low confidence or stale | Early | Deterministic facts + generated prose |
| Review/UGC moderation assistant | Detect spam, abuse, duplicate content, unsafe text, suspicious patterns | Early | Human/admin final decision |
| Conflict-resolution assistant | Compare OSM/Data.gov/business/user evidence and recommend canonical resolution | Early | Human/deterministic resolver final authority |
| Business growth copilot | Summarize location performance and propose next actions | Next | Recommendation only |
| Intelligence triage | Cluster/analyze anomalies and prioritize operator workload | Next | Recommendation only |
| Fleet operations copilot | Explain utilization/maintenance anomalies and prioritize actions | Next | Recommendation only |
| Enterprise intelligence copilot | Explain network/partner performance and recommend allocation/action | Later | Recommendation only |
| Conversational Kleenest assistant | Help users find, understand, save, route, and verify locations | Next | Tool/RAG constrained |

### AI that should NOT be built first

- autonomous reputation scoring;
- autonomous business entitlement changes;
- autonomous location merges;
- autonomous review deletion;
- autonomous pricing;
- unrestricted database agent;
- AI-generated facts presented as verified location data.

These introduce unnecessary trust and safety risk before the deterministic data foundation is fully closed.

## Recommended AI architecture

Use a dedicated AI orchestration boundary in Supabase Edge Functions. Supabase supports AI model execution in Edge Functions and pgvector-based semantic retrieval; Edge Functions are also appropriate for small AI inference/orchestration workloads. citeturn0search2turn0search6

For retrieval, keep embeddings in Postgres/pgvector and expose similarity search through controlled RPCs. Supabase documents pgvector for semantic search/RAG and recommends controlled database functions for vector similarity queries. citeturn0search4turn0search8

For embedding freshness, use asynchronous generation/retry rather than synchronous UI writes. Supabase documents a pattern using triggers, queues, `pg_net`, `pg_cron`, and Edge Functions to keep embeddings synchronized. citeturn0search1

Proposed boundary:

`UI/tool request → AI Edge Function → authorized retrieval/RPC → deterministic context packet → LLM → structured response → recommendation/explanation record → UI`

AI should receive only the minimum authorized context required for the task.

## AI data objects to introduce later

Prefer a small canonical set:

- `ai_runs` — model/provider/version, latency, status, token/cost metadata where available;
- `ai_artifacts` — generated summary/explanation/classification with source references;
- `ai_recommendations` — structured suggestion tied to a domain record;
- `ai_feedback` — accepted/rejected/edited outcome;
- `ai_evaluations` — quality/safety benchmark results;
- embeddings linked to canonical content through a stable content identity.

Do not create a parallel AI copy of locations, reviews, reputation, businesses, or routes.

## AI quality gates

Every production AI feature should satisfy:

1. authorized context only;
2. provenance/source references;
3. structured output where downstream code depends on it;
4. deterministic validation before persistence;
5. confidence/uncertainty surfaced where meaningful;
6. model/version recorded;
7. timeout/error fallback;
8. rate/cost control;
9. prompt-injection resistance for retrieved user content;
10. human review for moderation/destructive actions;
11. evaluation fixtures before release;
12. telemetry tied to downstream outcomes.

## Execution order

`Slice 1 → Slice 2 → Slice 3 → Slice 4 → Slice 5 → Slice 6 → Slice 7 → Slice 8 → Slice 9 → Slice 10`

Slices 1–3 are the current foundation and should be executed as large integration batches. Slice 4 becomes the first major intelligence-quality expansion. Slice 5/6 closes monetizable operator loops. Slice 7 introduces AI after the authoritative intelligence path is sufficiently stable. Slices 8–10 harden scale and production readiness.

## Definition of done for a large slice

A slice is complete only when:

- canonical backend authority exists;
- auth/RLS is correct;
- domain service uses the canonical contract;
- AppContext/runtime receives authoritative state;
- canonical navigation reaches the feature;
- the primary action works;
- mutation/query succeeds in production-shaped conditions;
- authoritative state refreshes;
- dependent surfaces receive the change;
- telemetry records the lifecycle;
- offline/realtime semantics are explicit where applicable;
- failure states preserve existing good data;
- automated/static tests cover the contract;
- no duplicate service or data model was introduced;
- documentation/matrix is updated;
- commit is recorded.

## Immediate next execution target

Start with **Slice 1 — Map/Location Authority Closure**, then immediately carry the verified location identity through **Slice 2 — Consumer Trust Loop Closure**. Do not pause for isolated UI polish between those slices. The current architecture is ready for larger batches; the primary objective is to convert breadth into verified interoperability and real consumer activation.
