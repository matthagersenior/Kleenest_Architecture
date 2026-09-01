# Cross-App Capability Parity Sweep — 2026-09-01

This sweep is a release gate across Consumer/Premium, Business, Fleet and Owner. It uses Architecture/main as authority and applies the canonical completion trace:

`UI/runtime → domain service → identity/role/entitlement → authoritative Supabase RPC/table/Edge Function → side effects → authoritative refresh → telemetry → CI/APK`

A route or service file by itself is not completion.

## Product boundaries

| Capability family | Consumer/Premium | Business Standard | Business Growth | Business Enterprise | Fleet | Fleet Enterprise | Owner |
|---|---|---|---|---|---|---|---|
| Identity/profile | REQUIRED | REQUIRED | REQUIRED | REQUIRED | REQUIRED | REQUIRED | OBSERVE/ADMIN |
| Public location discovery/map | REQUIRED | — | — | — | operational subset | operational subset | OBSERVE |
| Location evidence/quality | REQUIRED contribution | REQUIRED own locations | REQUIRED | REQUIRED | operational/read | cross-location | ADMIN/QUALITY |
| Photos | REQUIRED | REQUIRED own locations | REQUIRED | REQUIRED | — | — | MODERATE |
| Check-in/verification | REQUIRED | analytics/operations | analytics/operations | analytics/operations | operational | cross-location | OBSERVE/ADMIN |
| Favorites/saved | REQUIRED | — | — | — | — | — | — |
| Routing | REQUIRED | — | — | — | REQUIRED operations | REQUIRED | OBSERVE |
| Offline packs/sync | REQUIRED | — | — | — | REQUIRED | REQUIRED | HEALTH |
| Live network | REQUIRED | business signals | advanced signals | network signals | REQUIRED | REQUIRED | OBSERVE |
| Social/messaging | REQUIRED | customer engagement where canonical | engagement | engagement | recipient/network subset | subset | MODERATE |
| Family | GATED CONSUMER UPGRADE: purchaser + up to 4 additional users (5 seats total), shared Premium value at family economics | — | — | — | family entitlement may be consumed only through canonical Consumer/Premium identity | same | ADMIN/ENTITLEMENT OBSERVE |
| Progression/rewards/games/contests | REQUIRED | engagement/contest management | REQUIRED management | REQUIRED | Premium recipient linkage | linkage | OBSERVE |
| Preferred/single-use access | REQUIRED | program/provider side | program/provider side | network/provider side | recipient subset | recipient subset | ADMIN |
| QR | scan/check-in | REQUIRED lifecycle | REQUIRED + analytics | REQUIRED + network | operational attribution | cross-location | OBSERVE/ADMIN |
| Business CRUD | — | REQUIRED (1 location) | REQUIRED (≤5) | REQUIRED (6+/scale) | bundled Standard entitlement is separate Business surface | separate Business surface | ADMIN |
| Reviews/replies | consumer review | REQUIRED reply/ops | REQUIRED | REQUIRED | operational signal | signal | MODERATE |
| Promotions/campaigns/events | consumer exposure | tier-gated canonical subset | REQUIRED | REQUIRED cross-network | — | enterprise coordination where canonical | OBSERVE/ADMIN |
| Business intelligence | consumer-facing explanations only | core | ADVANCED | ENTERPRISE | fleet intelligence | cross-location advanced | CROSS-NETWORK |
| Prevention/remediation/reverification | contribution/read | REQUIRED | REQUIRED | REQUIRED | handoff/read where entitled | cross-location | ADMIN/QUALITY |
| Governance/members/roles | account/family | REQUIRED business scope | REQUIRED | ADVANCED | REQUIRED fleet scope | ADVANCED | PLATFORM ADMIN |
| Enterprise networks/outcomes | — | — | subset only where contract grants | REQUIRED | — | REQUIRED fleet layer | ADMIN/OBSERVE |
| Fleet operations/execution | — | optional handoff only | optional handoff | integration | REQUIRED | REQUIRED | OBSERVE/ADMIN |
| Notifications/push | REQUIRED | REQUIRED | REQUIRED | REQUIRED | REQUIRED | REQUIRED | DELIVERY HEALTH/ADMIN |
| AI assistance | REQUIRED grounded helper | REQUIRED | REQUIRED | REQUIRED | only when canonical Fleet task exists | same | governance/observe, not provider-key client |
| Analytics/telemetry | REQUIRED | REQUIRED | REQUIRED | REQUIRED | REQUIRED | REQUIRED | CROSS-NETWORK |
| Support | REQUIRED | REQUIRED | REQUIRED | REQUIRED | REQUIRED | REQUIRED | ADMIN |
| Ingestion | worker only | worker only | worker only | worker only | worker only | worker only | CONTROL/HEALTH only |
| Capability/admin controls | — | — | — | org governance only | — | org governance only | REQUIRED |

## Family capability contract

Family is not a separate application and is not a default free Consumer feature. It is a **Consumer capability layer and paid upgrade** designed to reduce the effective per-user Premium cost for a household/group of up to five people.

Canonical product behavior:

1. A Consumer account purchases/owns the Family upgrade and becomes the family owner.
2. One Family subscription provides **5 total seats**: the owner plus up to four additional accepted members.
3. Members retain independent Consumer identities, profiles, history, progression, privacy boundaries and personal data; Family shares entitlement, not accounts or credentials.
4. Accepted active members receive the Premium capability set through the canonical family entitlement check. The backend remains authoritative for access; the client must not infer Premium from invitation state alone.
5. Invites, acceptance, removal/leave/revocation, seat count and owner state must refresh authoritative family state and Premium entitlement immediately.
6. The Consumer membership/upgrade surface must show Family as a distinct upgrade option with the five-seat value proposition and savings relative to purchasing five individual Premium memberships. Exact price/savings copy must come from the active commerce/catalog authority rather than being hard-coded into the app.
7. Family does not grant Business, Fleet or Enterprise capabilities. If the same identity has those products, they remain independently entitled.
8. Family membership must not merge favorites, messages, location history, reviews, game progress or other personal Consumer data unless a separate explicit shared-family feature is later defined.
9. Owner/control-plane may observe and administer entitlement/support state through privileged audited contracts, but it is not a family-member runtime.
10. Family telemetry must cover upgrade exposure, purchase/restore outcome, invite lifecycle, seat utilization and entitlement activation without leaking private member content.

Existing canonical backend evidence already includes `family_groups`, `family_members`, `family_accounts`, `family_invites`, `create_family_group`, `invite_family_member`, `accept_family_invite`, and `family_has_premium_access`. Implementation should extend/wire that authority rather than create a parallel family store.

## Current repository evidence

### Consumer/Premium — Kleenest_Production
Current mobile routes visibly cover AI assistant, access, account deletion, activity, discovery, Game Center, location detail/contributors, membership, messaging, notifications and offline, in addition to the established map/community/profile/QR/routes/rewards surfaces. Recent repair work materially closes the old Batch-1 RED items for messaging, offline and partner/access surfaces.

**Still release-gated:**
1. Game Freshness Engine must be wired into the actual games.tsx round loop, not merely exist in the service/backend.
2. Native Premium purchase/restore and ad-free entitlement behavior require exact Android verification.
3. Native notification registration/delivery and Android permission behavior require exact APK verification.
4. Family must be implemented as the gated five-seat Consumer upgrade: membership/catalog entry, purchase/restore entitlement, owner + four additional seats, invite/accept/remove/leave lifecycle, authoritative Premium propagation, seat utilization and telemetry.
5. Photos/contribution flow requires exact Android media/storage verification.
6. Every repaired capability must pass current-head CI and APK build.

### Business — Kleenest_Business
Current routes include assistant, engagement, enterprise, governance, intelligence, locations, members, notifications, prevention, profile, QR Studio, reviews and trust operations. Services include AI, auth, business CRUD, engagement, enterprise, governance, intelligence, media, members, notifications, prevention, reviews and trust operations.

**Parity conclusion:** Business has the correct major product families and is substantially broader than its earlier shell. Remaining gate is depth, tier enforcement and end-to-end authority—not adding Consumer map/routing screens that Business intentionally excludes.

**Must verify/close before Business APK is called complete:**
1. Business profile + location CRUD, hours, amenities/accessibility and media are all actionable and refresh authoritative state.
2. Standard/Growth/Enterprise location ceilings are enforced server-side and reflected in UI.
3. QR Studio covers create/edit/activate/archive/attribution/analytics/redemption as applicable.
4. Reviews/replies/evidence, trust operations, prevention/remediation/reverification are actionable rather than read-only summaries.
5. Promotions, campaigns, contests and events have full create/update/state-transition paths at correct tiers.
6. Custom notifications cover composition/audience/authorization/delivery observability at the canonical boundary.
7. Intelligence replaces raw diagnostic JSON with product-quality cards/actions while retaining canonical authority.
8. Governance/member role mutations and entitlement visibility are fully server-authorized.
9. Enterprise networks/campaigns/outcomes/ROI/integration controls are gated and actionable where Architecture grants them.
10. Business support/account lifecycle and Android notification/media behavior must be verified.
11. CI and Android APK must correspond to the exact audited head.

### Fleet — Kleenest_Fleet
Current routes include operations, execution, signals, metrics, sync, intelligence, Premium and Enterprise. This is aligned with the Fleet product boundary rather than duplicating Consumer or Business UI.

**Must verify/close:**
1. Fleet identity/membership and Premium recipient provisioning/revocation.
2. Vehicles/drivers/routes CRUD and operational state transitions.
3. Route execution, updates, exceptions, alerts and notification delivery.
4. Offline/sync resilience for field operation.
5. Location suitability/intelligence and live-network interoperability with Consumer/Premium.
6. Metric snapshots, scorecards, goals/threshold/configuration separation (`Observe ≠ Configure ≠ Operate`).
7. Base Fleet one-location monitoring ceiling and Enterprise multi-location enforcement.
8. Enterprise governance/cross-location intelligence/integrations.
9. Bundled Business Standard remains an entitlement to the Business surface; Fleet must not silently gain Business Growth.
10. CI + Android APK on exact audited head.

### Owner — Kleenest_Owner
Owner is intentionally not product-parity UI. Current routes are control plane, access and operations; its service already reaches control-plane snapshot/history, pending businesses, Business access, memberships, capability classification/retirement/schema/CRUD audits, platform overview/integrity/activity/reports, ingestion health, push/native-push health and backend resource catalog.

**Largest current parity gap:** Owner's canonical responsibility list is much broader than its four-screen UI. It still needs explicit product-quality surfaces/actions for organization/user lifecycle, support, trust/safety/moderation, provenance/conflicts/verification, integrations, cross-network analytics/intelligence, notification/event visibility and billing/subscription visibility. These should use privileged audited backend contracts rather than replicas of customer app screens.

## Cross-app collision checks

- Enterprise remains a capability layer in Business and Fleet; no Enterprise app.
- Family remains a gated Consumer capability layer; no Family app and no automatic Business/Fleet/Enterprise grants.
- Fleet's bundled Business Standard does not copy Business runtime into Fleet.
- Ingestion remains worker infrastructure; customer apps do not receive ingestion controls.
- AI remains a canonical server-assisted capability; provider secrets never move to apps.
- Shared network state crosses apps through Supabase authority/events, never direct source imports.
- Consumer Free/Premium core functional parity is preserved; Premium/Family value is expressed through the explicitly entitled capability/value contract rather than accidental omissions.

## Repair order from this sweep

1. Finish Consumer release gates already in flight (fresh games, Family five-seat upgrade, media/purchase/push verification, CI/APK).
2. Close Business depth/tier/action gaps and rebuild exact-head Business APK.
3. Fleet full operational parity sweep and repair, then APK.
4. Expand Owner from current control-plane foundation into its missing canonical admin/health/governance surfaces, then private APK.
5. Re-run this matrix against live Supabase authorization/side effects and exact release heads.

No app is considered parity-complete from route inventory alone.