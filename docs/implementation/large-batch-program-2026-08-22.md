# Kleenest Large-Batch Feature Wiring Program

Date: 2026-08-22

## Authority order

1. Production Supabase is backend/data authority.
2. `Kleenest_App` is behavioral/reference evidence.
3. `Kleenest_Architecture` is the canonical implementation architecture.
4. Legacy repositories are archaeology/reference only.

## Implementation invariant

Every capability must close the full chain:

`producer -> canonical identity/data -> consumers -> backend contract -> authorization/entitlement -> UI action -> realtime/offline behavior -> resulting signal`

No UI capability may exist without a real backend contract. No duplicate service may be introduced where a canonical service already exists. Analytics consumes canonical facts and does not create shadow business facts. Realtime is delivery, not authority. Offline replay must use the same authoritative mutation path as online behavior.

## Batch sequence

### 0. Runtime and contract foundation

- Canonical capability registry is now committed at `src/architecture/capabilityRegistry.js`.
- AppContext exposes `capabilityRegistry` and `workspaceCapabilities`.
- Audit every `services.*` UI reference against the registry.
- Audit every CTA against a canonical service action.
- Identify stale wrappers and duplicate service implementations.
- Lock canonical IDs for locations, routes, evidence, and entitlements.

### 1. Consumer location loop

Wire location discovery, place detail, hours, amenities, quality, confidence, external-source agreement, favorites, directions, visits, check-ins, reviews, evidence, photos and verification into one canonical location interaction loop.

### 2. Bathroom engagement engine

Close:

`arrival -> QR/geofence -> check-in -> restroom rating -> observation/evidence -> quality -> progression -> reward -> leaderboard -> intelligence`

One verified interaction may feed multiple downstream consumers without duplicating the source fact.

### 3. QR platform

QR becomes a general interaction primitive for location identification, check-in, rating, Quest launch, reward claims, promotion redemption, event/campaign attribution, Fleet actions and Enterprise programs. QR initiates an authoritative downstream action; it does not own duplicate state.

### 4. Geofence platform

Wire enter/dwell/arrival/exit events to contextual notifications, Quest tasks, check-in opportunities, campaign attribution, offers and Fleet route/stop opportunities. Fleet uses the same geofence capability rather than a separate engine.

### 5. Quest orchestrator

Authorized Business/Fleet/Enterprise/Admin creators can define routes and tasks such as QR scan, geofence arrival, check-in, rate, observe, upload evidence, visit, route stop and redemption. Completion feeds progression/reward/leaderboard/intelligence.

### 6. Progression and rewards

Wire verified activity into XP, points, levels, streaks, badges, challenges, contests and reward eligibility. Preserve opt-in boundaries for operational metrics becoming user progression signals.

### 7. Cross-tier leaderboard system

Unify consumer, contributor, Business, Fleet, Enterprise and network leaderboard scopes around canonical metrics. Participation can generate recognition, perks, discounts, featured placement or other authorized rewards.

### 8. Business Growth OS

Wire locations, campaigns, events, promotions, QR, geofences, engagement attribution, redemptions, certifications, earned perks, growth signals, benchmarks and ROI into one Business loop.

### 9. Fleet Operations OS

Wire vehicles, drivers, routes, stops, service events, operational/performance events, daily metrics, metric definitions/assignments, scorecards, Fleet leaderboards and network intelligence.

### 10. Enterprise Command Center

Wire partner networks, memberships, metrics, campaigns, allocations, outcomes, engagement events and intelligence into a shared network model.

### 11. Intelligence/action loop

`canonical fact -> derived intelligence -> recommended action -> UI CTA -> authoritative mutation -> new fact -> refreshed intelligence`

Use existing intelligence action links and notification infrastructure rather than creating parallel recommendation systems.

### 12. Notifications and Live Network

Contextualize notifications around facts and recommended actions. Geofence and intelligence events may create notification opportunities. Notification delivery remains separate from authoritative state.

### 13. Offline and realtime

Add offline packs/queues and replay using canonical mutation contracts. Add realtime subscriptions only where they improve delivery/UX without becoming a second source of truth.

### 14. Admin control plane

Expose capability audit, integrity, moderation, verification, feature access, entitlements, pricing, ingestion, intelligence, notification and support controls. Keep owner/admin operations gated.

### 15. Trust and location quality

Combine external sources, ingestion, confidence, conflicts, user observations, verification and contributor reputation into location trust/quality signals.

### 16. Security gate

Before exposing privileged writes, map table/RPC access to public/read, authenticated/write, Business, Fleet, Enterprise and Admin scopes. Review RLS-disabled Production tables before enabling broad write paths. Do not apply blanket RLS changes without policies and verification.

### 17. Performance gate

After functional usage paths are stable, consolidate duplicate indexes/policies, add missing foreign-key indexes where justified, and fix RLS initialization-plan issues according to Supabase guidance.

### 18. Runtime/Pages hardening

Make the React/Vite runtime the canonical interactive application while preserving the static Pages shell as deployment safety net. Require successful build, Pages deployment, runtime startup, navigation and representative capability checks before considering the batch complete.

## Batch completion checklist

- [ ] Production authority confirmed
- [ ] Canonical service identified
- [ ] Authorization boundary identified
- [ ] UI route exists
- [ ] UI CTA exists
- [ ] CTA calls authoritative service action
- [ ] Success state visible
- [ ] Failure/authorization state visible
- [ ] Analytics event is downstream of canonical fact
- [ ] Realtime/offline behavior uses same authority
- [ ] Cross-tier consumers identified
- [ ] No duplicate service/state introduced
- [ ] Build passes
- [ ] Pages deploys
- [ ] Runtime smoke test passes

## Current implementation status

Foundation batch is active. The canonical capability registry has been added and AppContext now exposes it to the runtime. The next implementation batch is the Consumer location interaction loop, followed by QR/geofence/Quest orchestration.
