# Kleenest Mobile Store Readiness

## Production source of truth
- Repository: `matthagersenior/Kleenest_Architecture`
- Production implementation branch: `main`
- Consumer app: `apps/consumer-mobile`
- Business app: `apps/business-mobile`

## Release objective
Ship two real native applications:
1. Kleenest Consumer — iOS + Android
2. Kleenest Business — iOS + Android

Both applications must use the canonical Kleenest backend/capability layer and must not depend on JSON/operator-only workflows for ordinary users.

## Batch program
### Batch 0 — Source, deployment, and mobile foundation
- map repository and entry points
- verify deployed source/commit
- audit Expo/EAS configuration
- audit environments and Supabase integration
- audit authentication/authorization
- audit maps/location
- identify duplicate/legacy implementations
- establish release/version strategy
- fix critical blockers discovered during the audit

### Batch 1 — Consumer vertical slice
Install → location → discovery → restroom detail → navigation → check-in → observation.

### Batch 2 — Business vertical slice
Install → business authentication → organization → dashboard → location → QR → intelligence/response.

### Batch 3 — Shared production capabilities
Auth recovery, account deletion, secure storage, permissions, deep links, notifications, error handling, offline/failure recovery.

### Batch 4 — Consumer completeness
Community, reviews, trust, rewards, quests, profile, settings, subscriptions.

### Batch 5 — Business completeness
Campaigns, promotions, analytics, team/roles, billing, operational workflows.

### Batch 6 — Store compliance
Privacy/data inventory, terms, account deletion, Apple disclosures, Google Data Safety, permissions, subscriptions, age/content ratings.

### Batch 7 — Release engineering
CI validation, EAS builds, signing, TestFlight, Play internal/closed testing, crash diagnostics, release automation.

### Batch 8 — Production release
Release candidates, store metadata, screenshots, review notes, submission, staged rollout, post-release monitoring.

## Exit criteria
The program is complete only when both apps can be installed from their respective stores and complete their primary user journeys against production services.
