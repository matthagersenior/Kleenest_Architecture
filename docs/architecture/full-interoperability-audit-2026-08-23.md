# Full Interoperability Audit — 2026-08-23

## Conclusion

The GitHub ↔ Supabase ↔ Architecture ↔ donor audit is sufficiently complete to switch from discovery-driven migration to commit-oriented bulk reconciliation.

The live Supabase capability graph is materially richer than the visible shell, but the major hidden-capability archaeology is now classified. Most capabilities are already backed by canonical RPCs/tables/services; the remaining work is primarily runtime consumer wiring, cross-domain bridges, telemetry/value closure, and security hardening.

## Source reconciliation

- Architecture `main`: canonical product/runtime.
- `Kleenest_App` `main`: primary behavioral donor.
- `KleenestApp` `main`: earlier behavioral donor.
- Production Supabase `ssgesjzdvdsqacdtasje`: backend authority.
- Existing interoperability, runtime-wiring, capability inventory, consumer-parity, Supabase-gap, and large-batch audit documents.

## Stable ownership map

| Capability | Authority / owner | Architecture state | Merge action |
|---|---|---|---|
| Auth/session/profile | Supabase Auth + account | Wired | preserve |
| Account entitlements | account/product entitlement RPCs | Partial but reconciled | finish consumer coverage |
| Business authorization | memberships/domain gates | Canonical | never trust UI flags |
| Feature availability | `feature_catalog` | Canonical | reuse |
| Location identity/discovery | locations + discovery RPCs | Wired/partial | close identity edges |
| Evidence/quality | quality observations/reviews | Backend canonical | wire consumers |
| Verification/reputation | verification/reputation RPCs | Backend canonical | wire downstream signals |
| Route discovery | route plans/sessions/cells | Canonical Maps/Route | wire consumer |
| QR/check-in | QR/check-in authority | Wired | close progression/engagement bridges |
| Progression/rewards | progression/reward stores | Partial | merge donor behavior |
| Business engagement | campaigns/QR/events/promotions | Backend-rich | merge workspace consumers |
| Fleet operations | fleet facts/projections | Substantially wired | close telemetry/intelligence |
| Fleet controller metrics | No full definition model | Genuine gap | thin adapter only |
| Enterprise partners | networks/campaigns/allocations/outcomes | Backend-rich | merge analytics consumers |
| Notifications | event -> notification -> delivery | Canonical platform | preserve shared boundary |
| Realtime | delivery/invalidation | Platform | no authority state |
| Offline | packs/queue/replay | Partial/real consumer | close telemetry/recovery |
| External ingestion | sources/records/jobs/ingest RPCs | Canonical infrastructure | expose admin/status |
| Intelligence | derived signals/action links/jobs | Backend-rich | close action loop |
| Admin | authorization/maintenance/data integrity | Foundation wired | harden privileged paths |
| Commerce/access offers | offers/purchase/redemption | Backend-only/partial | wire product-access workflows |
| Live network | events/reactions | Partial | merge consumer path |
| Support/feedback | backend + UI pieces | Partial | wire role-aware surface |

## Canonical dependency graph

### Consumer trust graph

`external source -> external observation -> canonical location -> user observation -> quality review -> verification/confidence -> reputation -> intelligence`

### Engagement graph

`GPS/route/QR/geofence -> canonical location -> arrival/check-in -> rating/evidence -> progression/reward -> leaderboard/reputation -> notification/intelligence`

### Business graph

`business location -> QR/geofence/campaign/event/promotion -> engagement attribution -> redemption/outcome -> analytics/ROI -> recommended action`

### Fleet graph

`vehicle/driver/route -> operational/performance event -> daily metrics/scorecard/snapshot -> controller goal/threshold -> intelligence/notification -> operational mutation`

### Enterprise graph

`partner network -> membership -> campaign/allocation -> engagement/outcome -> ROI/benchmark -> command-center action`

### Platform graph

`canonical fact -> analytics/coverage -> notification/realtime/offline read model`

## Audit classifications

### Canonical / do not duplicate

- external ingestion
- evidence/quality
- route discovery
- account entitlement resolution
- feature catalog
- Fleet operational telemetry
- Fleet scorecards/projections
- Enterprise partner analytics
- notification event/materialization/delivery
- offline canonical mutation path

### Backend-rich / consumer wiring target

- preferred locations
- access offers/purchase/redemption
- contributor reputation/milestones
- badges/challenges/games/quests/contests/leaderboards
- Business media/promotions/events/contests/campaigns/partnerships
- Enterprise allocations/outcomes/ROI
- Fleet route notifications/service opportunities
- intelligence actions/jobs
- push subscription lifecycle
- live network
- support/feedback
- external ingestion/admin status

### Genuine new model

Fleet controller-authored configuration:

`business -> controller -> metric -> goal/threshold -> scoring rule -> scope`

This must be a thin adapter over existing Fleet measurements/progression, not a replacement metrics engine.

## Security gates

The audit retains the following blockers for privileged promotion:

1. `get_partner_network_benchmark()` requires owner-business authorization equivalent to neighboring partner analytics functions.
2. SECURITY DEFINER search paths must be hardened.
3. SECURITY DEFINER grants must be explicitly classified as public-safe, authenticated, worker, or admin.
4. RLS-enabled tables without appropriate policies must remain gated.
5. Leaked-password protection remains a security configuration gate.

## Telemetry model

The application now has capability coverage plus activity telemetry. The intended measurement chain is:

`canonical fact -> feature access/outcome -> analytics -> capability coverage -> product value`

Telemetry must remain downstream of authoritative mutations and must never become the business source of truth.

## Bulk merge strategy

Use `docs/architecture/merge-batch-manifest-2026-08-23.md` as the execution index.

Merge order:

1. account/entitlement foundation
2. location/trust graph
3. QR/check-in/progression
4. Business engagement/lifecycle
5. Fleet operations/measurement
6. Enterprise partner analytics
7. intelligence/action loops
8. notifications/live network
9. offline/realtime
10. external/admin controls
11. commerce/access offers
12. security hardening
13. runtime/Pages validation

For each group, search known donor commits and Architecture history first. If the behavior already exists in a proven commit, reconcile that commit rather than rewriting it.

## Completion definition

The audit is considered complete for bulk migration when every capability is assigned one of:

- `canonical`
- `backend-rich / consumer wiring`
- `infrastructure`
- `privileged/admin`
- `security-blocked`
- `genuine-gap`
- `intentionally-excluded`

No material capability remains unclassified. The remaining implementation work is therefore executable migration, not open-ended archaeology.
