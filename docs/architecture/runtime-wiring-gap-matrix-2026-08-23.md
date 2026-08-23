# Runtime Wiring Gap Matrix — 2026-08-23

## Sources reconciled

- `Kleenest_Architecture` — forward source and production runtime.
- `Kleenest_App` — primary donor/reference source.
- `KleenestApp` — earlier donor/reference baseline.
- Production Supabase project `Kleenest Production` — `ssgesjzdvdsqacdtasje`.
- `docs/architecture/interoperability-matrix-2026-08-22.md`.
- `docs/migration/donor-feature-migration-ledger.md`.
- `docs/audits/github-supabase-gap-audit.md`.
- `docs/audits/batch-aq-complete-app-architecture-product-ux-audit.md`.
- `src/architecture/featureParity.js`.

## Production reality

The live public schema contains a substantially larger capability graph than the visible consumer shell. It includes canonical locations/places, discovery, amenities, photos, check-ins, reviews, favorites, follows, social, messages, notifications, progression, contests, route lifecycle, offline packs, business operations, partnerships, Enterprise networks, Fleet operations/metrics, external ingestion, intelligence, live network, entitlements, pricing, family, support and Admin controls.

All production tables are currently RLS-enabled. The Supabase security advisor still reports important policy/function issues; these are tracked as security gates rather than treated as product wiring.

## Capability classification

### Consumer / location graph

- Map discovery/search — wired.
- GPS nearby discovery — wired; GPS selects the search origin, Supabase remains the location authority.
- Canonical location identity — partial; every place action must resolve `locations.id` before mutation.
- Place detail/intelligence — wired/partial depending on downstream signal.
- Favorites — partial; `favorites` and `location_favorites` both exist and require one authoritative mutation/read path.
- Check-in / QR — wired.
- Reviews/replies/rewards — wired.
- Evidence/observations/amenity feedback — partial.
- Bathroom verification — partial.
- Route lifecycle — wired.
- Route discovery — partial.
- Offline packs/replay — partial.
- Preferred-location activation/usage — backend-only.
- Single-use access offer/purchase/redemption — backend-only.

### Progression / network participation

- Points/reward history — wired.
- Badges/streaks — partial.
- Challenges — partial.
- Games — partial.
- Contests — partial.
- Quests — partial.
- Leaderboards — partial.
- Contributor reputation/milestones — backend-only.
- Cross-tier/network leaderboard — partial.

### Business operating system

- Locations — partial.
- Media — partial.
- QR — partial.
- QR engagement programs — backend-only.
- Promotions/redemption — partial.
- Campaigns — partial.
- Events/RSVP — partial.
- Contests — partial.
- Engagement attribution — partial.
- Partnerships/programs — partial.
- Preferred locations — backend-only.
- Certifications — backend-only.
- Clubs — backend-only.
- Earned perks — backend-only.
- Search boosts — backend-only.
- Intelligence/analytics/ROI — partial.

### Fleet

- Operations — partial.
- Vehicles/drivers/routes — partial.
- Maintenance/alerts — partial.
- Performance/scorecards — partial.
- Controller metric configuration — wired.
- Controller metric values/scores — partial.
- Service opportunities — partial.
- Route notifications — backend-only.
- Telemetry ingestion — infrastructure/backend-only.

### Enterprise

- Command center — partial.
- Partner networks/memberships — partial.
- Campaigns — partial.
- Allocations — backend-only.
- Outcomes/metrics — partial.
- ROI/benchmarks — partial.
- Enterprise Fleet enablement — backend-only.

### Platform / Admin

- Authentication/session/profile — wired, with recent schema/runtime hardening.
- Membership/entitlements — partial; owner/admin precedence is implemented but entitlement surfaces still need workflow coverage.
- Notifications/inbox/realtime — wired; push subscription lifecycle remains partial.
- Live network — partial.
- Intelligence action links/jobs — partial.
- Admin control/maintenance — wired foundation.
- Account deletion — backend-only.
- Support/feedback — partial.
- External data catalog — backend-only/admin candidate.
- External ingestion — infrastructure/admin candidate.
- Commerce/pricing/subscriptions — partial; payment processor boundary remains separate from entitlement authority.

## Hard security gates

The current Supabase advisor identifies:

1. RLS-enabled tables without policies, including Fleet metric configuration, Fleet operational events, verification campaigns/targets, map discovery cache, entitlements, leaderboard participation and rewards.
2. Mutable function search paths on quest, map, QR, favorites, intelligence and Fleet helpers.
3. Anonymous execution of SECURITY DEFINER functions that need explicit public-safe/authenticated/worker/admin classification.
4. Authenticated execution of many SECURITY DEFINER functions that need explicit internal authorization review.
5. Leaked password protection disabled.

No capability is promoted to `wired` solely because an RPC exists. The gate is: canonical identity → authoritative store → authorization/RLS → service → AppContext → runtime consumer → reachable action → analytics/realtime/offline behavior.

## Highest-value wiring order

1. Consumer trust graph: location details → evidence/observations → verification → reputation → intelligence.
2. Progression: challenges → games → quests → contests → rewards → leaderboards → reputation.
3. Business engagement engine: QR programs → promotions → events → contests → attribution → ROI.
4. Business operating lifecycle: locations → media → amenities → certification → partnerships → perks/search boosts → analytics.
5. Fleet operating loop: operations → alerts/maintenance → performance → controller values → goals → notifications.
6. Enterprise allocation loop: networks → partners → campaigns → allocations → outcomes → ROI.
7. Access/commerce: offers → purchase → redemption → preferred-location activation/usage → attribution.
8. Offline/realtime: use canonical mutations only; caches and realtime remain transport/read-model layers.
9. Security: classify and harden Supabase function grants/RLS before exposing privileged workflows.

## Product shell decision

The visible application should not expose the backend capability graph as a flat list of pages. It should use membership-aware workspaces:

- Consumer: Explore, Routes, Activity, Play, Community.
- Business: Overview, Intelligence, Engage, Analytics.
- Fleet: Operations, Routes, Performance, Opportunities, Goals.
- Enterprise: Command, Partners, Campaigns, Performance, Fleet.
- Owner: Control Center, Governed Data, Audit, Maintenance, Tier Preview, Capabilities.

Capabilities should appear inside the workspace where the user makes the decision, rather than as permanent top-level navigation.

## Visual product direction

The current shell is functionally organized but visually too plain. The next UI pass therefore uses a deliberate Kleenest visual system: richer color accents, stronger workspace identity, layered surfaces, elevated cards, clear action hierarchy, better mobile composition, and contextual empty/loading/error states. It must remain information-dense and professional rather than becoming a decorative dashboard.
