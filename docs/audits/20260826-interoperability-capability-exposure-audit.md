# Kleenest — 2026-08-26 Interoperability / Capability Exposure Audit

## Authority
- **Canonical source:** `matthagersenior/Kleenest_Architecture:main`
- **Backend authority:** Production Supabase project `ssgesjzdvdsqacdtasje`
- **Reference only:** `matthagersenior/Kleenest_App:main` and other Kleenest repositories
- **Rule:** a backend object is not a product feature until a canonical UI action reaches it through the canonical service/AppContext/route boundary with authorization, refresh, telemetry, and offline/realtime behavior where applicable.

## Current reconciliation
Production has approximately 201 public tables, 446 public routines, 273 RLS policies and 74 triggers. The capability-control layer has 32 enabled feature-catalog entries, 6 active domain contracts, 442 function-classification rows and 26 retirement records.

The prior raw audit's 433 uncovered RPCs is not a missing-feature count; it is dominated by the narrow six-domain-contract denominator. Function classification and retirement state are the stronger governance signals.

A real privilege defect was found and repaired: `admin_list_activity_events(integer)` was inheriting EXECUTE from PUBLIC and therefore anon. Production now has no anon/public EXECUTE for that function and retains authenticated EXECUTE. The persistent migration is in `main`.

## Capability → actual exposure
- **GREEN:** canonical UI + recognizable front-to-back path.
- **YELLOW:** UI/backend path exists but one integration leg needs closure.
- **ORANGE:** backend exists but canonical operator/user termination is incomplete.
- **BLUE:** infrastructure/worker capability, not a normal user screen.
- **RED:** backend capability without a verified canonical user-facing termination.

| Feature | Actual exposure | Status | Slice |
|---|---|---|---|
| Data Control Center | Owner Control Center | GREEN | Governance |
| Business Analytics | Business Intelligence/Analytics | GREEN | Business |
| Custom Business Notifications | Business Notifications | GREEN | Business |
| Business Engagement | Business growth/engagement | GREEN | Business |
| Business Intelligence | Business Intelligence | GREEN | Business |
| Business QR | Business management | GREEN | Business |
| QR Studio | `/business/qr` canonical QR Studio | **GREEN** | Business |
| Business Workspace | Business workspace | GREEN | Business |
| Verify Amenities | Evidence/contribution | YELLOW | Consumer evidence |
| Deep Bathroom Verification | Evidence/verification | YELLOW | Consumer evidence |
| Add Location Photo | Evidence/media | GREEN | Consumer evidence |
| Rate Location | Location/review | GREEN | Consumer evidence |
| Helpful Review Vote | Visit/review flow | **GREEN** | Consumer evidence |
| GPS Check In | Visit flow | GREEN | Consumer evidence |
| QR Check In | Visit flow | GREEN | Consumer evidence |
| Enterprise Network Analytics | Enterprise Command Center | GREEN | Enterprise |
| Enterprise Workspace | Enterprise workspace | GREEN | Enterprise |
| Fleet Analytics | Fleet performance | GREEN | Fleet |
| Driver Safety Scorecards | Fleet performance | GREEN | Fleet |
| Fleet Intelligence | Fleet intelligence | GREEN | Fleet |
| Fleet Maintenance | Fleet operations | GREEN | Fleet |
| Fleet Metric Configuration | Fleet performance/metrics | GREEN | Fleet |
| Fleet Operations | Fleet operations | GREEN | Fleet |
| Fleet Route Optimization | Fleet routes | GREEN | Fleet |
| Restroom Service Opportunities | Fleet opportunities | YELLOW | Fleet |
| Telematics Ingestion | Worker/ingestion boundary | BLUE | Fleet |
| Vehicle Utilization | Fleet metrics | YELLOW | Fleet |
| Fleet Workspace | Fleet workspace | GREEN | Fleet |
| Badges | Rewards | GREEN | Progression |
| Challenges | Rewards/challenges | GREEN | Progression |
| Quest Creator | Quest workflow | GREEN | Progression |
| Advanced Route Planner | Map/route workspace | GREEN | Maps/routing |

## Completed implementation slices

### Slice 0 — Governance / authority
Complete: authoritative branch rule, capability reconciliation, privilege repair, persistent migration.

### Slice 1 — Consumer evidence loop
Complete at the canonical visit surface: GPS/QR verification, observation capture, review creation, helpful-review vote, progression refresh/events, analytics, and navigation into canonical evidence/rewards/activity surfaces. Photo upload remains behind the separately verified media/storage boundary rather than inventing storage semantics.

### Slice 4 — Business QR Studio
Complete: canonical `/business/qr` surface now owns custom QR creation, activation/deactivation, deletion, location binding, purpose/action metadata, single-use/max-redemption configuration, test-link generation and clipboard handoff. It uses the existing business custom-QR RPC authority and business capability gate path.

## Remaining closure order
1. Slice 2 — Maps/routing outcome verification and event completion.
2. Slice 3 — Progression/social outcome synchronization.
3. Slice 5 — Fleet operational-event → metric → notification closure.
4. Slice 6 — Enterprise allocation → campaign → outcome closure.
5. Slice 7 — Stripe-backed commerce outcome chain.
6. Slice 8 — Notification/intelligence producer convergence.
7. Slice 9 — Offline/realtime convergence across every completed slice.

## Acceptance gate
A slice is complete only when its canonical UI is reachable, no duplicate runtime/service owns the capability, backend authority is explicit, authorization/entitlement is verified, actions are real, dependent UI refreshes from authoritative state, telemetry is recorded, realtime/offline semantics do not fork business logic, security/RLS/grants are verified, and the work lands as a coherent implementation commit.
