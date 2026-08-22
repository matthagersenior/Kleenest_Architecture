# Batch AQ — Complete Application Architecture + Product UX Audit

Date: 2026-08-22

## Scope

This is the pre-wiring audit across:

- Production Supabase schema, functions, feature registry, entitlements, pricing, RLS/security advisors, realtime/notification/routing/offline capabilities.
- `Kleenest_App` current main and its canonical runtime/interoperability matrix.
- Earlier/reference `KleenestApp` repository and its prior audit baseline.
- Existing Architecture repository ownership/interoperability contracts.
- Recent architecture commits, including canonical runtime consolidation, QR/check-in fixes, gamification wiring, live notification wiring, and Fleet metric configuration.

The objective is not to preserve the current page names or styling. The objective is to establish one product architecture in which every real capability has one owner, one authoritative data path, one UI home, and a complete working interaction chain.

No Production mutation was performed by this audit.

---

# 1. Executive result

The backend is significantly richer than the current visible application. The product should therefore be designed around **membership-aware workspaces**, not around exposing every backend capability as a top-level page.

The current canonical runtime is substantially cleaner than the historical app, but the product shell is still too generic: `Home / Map / Discover / Route / Profile / Social / Capabilities / Fleet Ops` treats very different audiences as peers. `CanonicalAppRuntime` is canonical, but it still contains a legacy `AppRuntime` compatibility path and a large consumer-oriented shell. This is an architectural and UX constraint, not a reason to return to the monolith.

The recommended product model is:

`Kleenest brand shell`
→ `authenticated identity + active membership/workspace`
→ `role/tier-specific navigation`
→ `shared capability surfaces`
→ `canonical Supabase operation`
→ `realtime/offline result`
→ `analytics/evidence/progression/network feedback`

The application should have **one shell and multiple workspaces**, not separate applications hidden behind arbitrary tabs.

---

# 2. Backend capability reality

Production currently contains a broad capability graph including:

- consumer profiles, favorites, follows, social, messaging and moderation;
- location discovery, canonical locations, Places, categories, amenities, photos and external sources;
- check-ins, QR, attribution, visits, observations, verification and quality;
- progression, points, badges, streaks, challenges, games, contests and leaderboards;
- routes, route stops/events, discovery sessions/cells/locations, map discovery cache and offline packs;
- notifications, notification events, deliveries, push subscriptions, push deliveries, intelligence notification jobs and realtime event surfaces;
- Business locations, campaigns, promotions, events, QR, media, clubs, certifications, preferred locations, earned perks, search boosts, analytics and engagement attribution;
- Enterprise partner networks, campaigns, allocations, outcomes, network metrics, intelligence and ROI analytics;
- Fleet vehicles, drivers, routes, maintenance, alerts, operational events, performance events, driver scorecards, vehicle daily metrics, metric snapshots and controller-authored metric configuration;
- Admin CRUD, moderation, data-integrity reporting, user/business management and demo/test capabilities;
- feature catalog and account/service entitlement infrastructure.

The Production table inventory is therefore the source of truth for capability completeness. A service wrapper is not itself proof of a complete feature.

---

# 3. Membership / product architecture

Production pricing currently describes these active product identities:

| Product | Price model | Primary purpose |
|---|---:|---|
| Consumer Free | $0 | discovery, map, community, basic routes, ads |
| Consumer Premium User | $5 one-time | advanced search/filter, favorite routes, progression, no ads |
| Family | $20 one-time | up to 5 users, premium features, shared favorites, no ads |
| Business Standard | $20/month | location management, basic stats, reviews, QR scans |
| Business Growth | $50/month | advanced stats, promotions, campaigns, contests, QR Studio, earned perks |
| Business Enterprise | custom | advanced analytics, partnerships, advanced campaigns, enterprise tools, Fleet add-on |
| Fleet | $75/month | up to 50 premium users, fleet management/dashboard/analytics, business-standard add-on |

This confirms the requested $5 one-time consumer upgrade and ad-removal model.

### Critical UX decision

**Tier is not merely an entitlement badge. Tier determines the primary job of the workspace.**

Consumer Free/Premium/Family should feel like a fun, useful location/community product.

Business Standard/Growth/Enterprise should feel like progressively deeper growth tooling.

Fleet should feel like an operational command center: concise, high-signal, action-oriented.

Admin should feel like a testing/control laboratory capable of impersonating or previewing each supported workspace while retaining privileged CRUD/analytics tools.

---

# 4. Recommended shell

Do not expose all pages in a permanent horizontal navigation bar.

### Global shell

**Brand:** Kleenest

**Primary global actions:**
- search/discovery;
- notifications;
- current workspace/membership switcher;
- profile/account;
- context-aware primary action.

**Primary navigation should be workspace-specific.**

### Consumer workspace

Recommended primary destinations:

1. **Explore** — map + nearby discovery + intelligent place cards.
2. **Routes** — favorite/advanced route planning and cached route access.
3. **Activity** — check-ins, evidence, contributions and personal history.
4. **Play** — challenges, badges, streaks, games and contests.
5. **Community** — social feed, follows, reviews and engagement.

Notifications remain global rather than becoming a destination competing with these jobs.

### Business workspace

Recommended primary destinations:

1. **Overview** — growth dashboard and current opportunities.
2. **Locations** — managed locations, profile/media/amenities/verification.
3. **Engage** — promotions, QR, events, contests, perks.
4. **Intelligence** — demand, quality, conversion, live network and recommended actions.
5. **Analytics** — funnel, ROI, reviews, QR, media and location performance.

Growth/Enterprise capabilities appear progressively inside these surfaces instead of becoming dozens of tabs.

### Enterprise workspace

Recommended primary destinations:

1. **Command** — network health and portfolio overview.
2. **Partners** — networks, memberships, agreements and partner programs.
3. **Campaigns** — advanced campaigns, allocations and contests.
4. **Performance** — network/partner ROI, outcomes and benchmarks.
5. **Fleet** — when entitled/enabled.

### Fleet workspace

Recommended primary destinations:

1. **Operations** — vehicles, drivers, routes, alerts and today's state.
2. **Routes** — route plans, discovery, stops, live route state and cached/offline route support.
3. **Performance** — driver scorecards, vehicle utilization, operational facts and Fleet measurements.
4. **Opportunities** — service opportunities and location intelligence.
5. **Goals** — Fleet controller metric definitions, assignments, current values and scores.

Fleet should not expose raw database concepts such as `fleet_metric_snapshots` as navigation labels.

### Admin workspace

Recommended primary destinations:

1. **Control Room** — health, current system state, alerts and integrity.
2. **Users & Access** — users, roles, tiers, family, business memberships and demo identities.
3. **Businesses** — business lifecycle and tier/verification controls.
4. **Content & Trust** — reports, moderation, reviews, evidence, verification.
5. **Data** — canonical datasets and safe CRUD/read-only data classifications.
6. **Analytics** — cross-product analytics and data integrity.
7. **Preview** — render the actual Consumer Free, Premium, Family, Business Standard, Business Growth, Enterprise and Fleet experiences.

Admin must never become a second implementation of every domain. It should call canonical domain contracts and use privileged administrative contracts only where explicitly required.

---

# 5. Navigation principles

### Remove page-name thinking

Users should navigate by **job**, not backend domain.

Examples:

- `Capabilities` should not be a normal consumer destination. It is useful as an internal/admin diagnostic surface.
- `Fleet Ops` should not appear in the consumer shell.
- `Social`, `Games`, and `Notifications` should be organically surfaced from the consumer workspace rather than competing with Map/Explore as unrelated products.
- Business analytics should be accessible from Overview/Intelligence/Analytics rather than forcing users through separate pages for every metric.

### Organic placement rules

A feature belongs where its **decision is made**:

- favorite → place/route;
- check-in → place/Explore;
- evidence → place/activity;
- challenge → Play;
- promotion → Engage;
- campaign → Engage/Intelligence;
- ROI → Analytics/Performance;
- route opportunity → Routes/Opportunities;
- Fleet alert → Operations;
- Fleet goal → Goals;
- partner outcome → Enterprise Performance;
- notification → global inbox/action destination.

---

# 6. Visual architecture

The current UI must receive a deliberate design pass after authority/wiring, not a cosmetic patch pass.

### Requirements from product direction

- No untouched text/banner/box styling left merely because it already exists.
- No accidental pill/tab forests.
- No arbitrary bordered containers used as default page structure.
- No giant text banners competing with actual work.
- Strong Kleenest branding without sacrificing information density.
- Clear hierarchy, whitespace and consistent card grammar.
- Feature-rich screens should feel simple because related capabilities are grouped by job.
- Buttons must have visible loading/success/error states and real downstream behavior.
- Responsive behavior must be designed rather than allowing overflow to dictate layout.

### Card grammar

Prefer a small number of reusable patterns:

- hero/workspace header;
- metric card;
- opportunity/action card;
- place/business card;
- timeline/event card;
- compact data table;
- command/action row;
- empty/loading/error state.

Cards should communicate **what, why, current state, and next action**.

---

# 7. Membership-aware UI

Membership identity should be visible but not obnoxious.

Recommended treatment:

`Kleenest` + `Premium` / `Family` / `Business Growth` / `Enterprise` / `Fleet` as a subtle workspace identity in the shell.

The user should always understand:

- which account/workspace they are operating in;
- what capabilities they have;
- what upgrade unlocks a blocked capability;
- whether a feature is included, unavailable, or temporarily unavailable.

Do not hide paid capability until users discover it exists. Show high-value locked features contextually with a clear reason and upgrade path.

---

# 8. Ads / $5 one-time purchase

The active pricing catalog confirms Consumer Free includes `ads`, while Premium includes `no_ads`; the Premium price is $5 one-time.

The ad system should therefore be a **layout-aware capability**, not a random banner component.

Rules:

- Free users may see tasteful ad placements in natural content gaps.
- Premium/Family users receive no ads.
- Business/Fleet/Enterprise/Admin surfaces should not inherit consumer ad placements.
- Ad placement must never obscure primary actions or operational information.
- Admin Preview must be able to render the Free experience with ads and Premium/Family without them.

The current `ad_placements` table is therefore a real product capability and should be surfaced through a dedicated placement service, not scattered JSX conditionals.

---

# 9. Feature interoperability model

The existing Architecture and App matrices are directionally correct:

`producer → canonical identity/data → consumer → backend contract → entitlement → UI action → realtime/offline behavior → resulting signal`

The audit strengthens that into a universal rule:

### Location graph

`locations.id` remains the canonical physical-place identity.

Everything must converge on it:

Map → Place → Check-in → Evidence → Reviews → Favorites → Routes → Business → Enterprise → Fleet → Intelligence → Notifications → Offline.

### Route graph

`route_plans / route_stops / route_events / location_route_events`

feed:

consumer routes → Live Network → Fleet → Enterprise → intelligence → offline packs.

### Feedback loop

`activity / evidence / quality / route / business / fleet event`
→ canonical event
→ measurement/intelligence
→ action/recommendation
→ notification/live network
→ user/business/fleet action
→ resulting event
→ refreshed analytics.

This is the core product loop and should be visible in architecture, not merely hidden in service files.

### Live Network

Live Network is a shared signal layer, not a consumer social feed.

The current privacy-safe implementation correctly restricts public network signals to non-personal event types such as verification, stale/conflict signals, business offers and Fleet task completion. Preserve this principle.

### Notifications

Notifications are the action-delivery layer:

`event → recipient resolution → notification → realtime/push → action destination → resulting signal`.

Do not create domain-specific notification stores.

### Routing/cache/offline

Cached routes and discovery are transport/read-model capabilities. They never become alternate authority.

Offline queues must replay into the same authoritative mutation path used online.

---

# 10. Fleet adapter audit

The Fleet metric adapter is conceptually correct and now exists in Production with RLS enabled, but the current audit identifies one immediate security hygiene issue:

- `fleet_metric_definitions` has RLS enabled with no policies detected by the advisor.
- `fleet_metric_assignments` has RLS enabled with no policies detected by the advisor.

The RPCs currently provide the intended authorization boundary, but the exposed tables should still be deliberately classified as RPC-only/write-protected and their RLS state should be verified explicitly. Do not expose direct client table mutation merely to silence the advisor.

The current App service correctly uses the four configuration RPCs, but it does not yet consume the existing `get_fleet_metric_values()` capability. Therefore the next Fleet UI wiring pass should be:

`configuration → assignment → current value → goal/threshold → score → action/notification`

rather than only CRUD over definitions.

The adapter must also consume the existing allowlisted source capabilities from `feature_catalog`, including:

- driver safety scorecards;
- maintenance;
- route optimization;
- service opportunities;
- telemetry ingestion;
- vehicle utilization;
- Fleet operations/analytics.

---

# 11. Security audit — current Production findings

The Supabase security advisor currently reports several classes of findings.

### A. RLS enabled without policies

At minimum, the current advisor identifies:

- `fleet_metric_definitions`
- `fleet_metric_assignments`
- `fleet_operational_events`
- `location_address_backfills`
- `location_verification_campaigns`
- `location_verification_targets`
- `map_discovery_cache`
- `user_feature_entitlements`

These need explicit classification: public-read, authenticated-read, RPC-only, worker-only, or admin-only. RLS should reflect that classification.

### B. Mutable function search paths

The advisor identifies mutable search paths on functions including Fleet metric source validation, favorites, engagement metrics, single-use QR and other helpers.

This should be hardened in a dedicated security batch by setting explicit `search_path` on security-sensitive functions.

### C. Anonymous SECURITY DEFINER exposure

The advisor currently identifies public/anonymous execution of functions including discovery, geofence notification, enterprise Fleet enablement, external metadata operations, Fleet route notification publication, intelligence event publication and others.

Not every one is necessarily a vulnerability; some may intentionally expose public read behavior. But every SECURITY DEFINER function must be classified explicitly as:

- public-safe;
- authenticated-safe;
- privileged worker-only;
- admin-only.

The API grant should match that classification.

### D. Authenticated SECURITY DEFINER exposure

The advisor identifies a very large number of authenticated-callable SECURITY DEFINER functions, including business CRUD, Enterprise actions, Fleet operations, progression and admin functions.

This is not automatically wrong. The correct standard is:

`authenticated execution + function-internal authorization + narrow input validation + fixed search_path`

For Admin and privileged functions, authorization must be explicit and never inferred from the UI.

### E. Auth password security

Leaked password protection is currently disabled. This should be enabled before production launch.

---

# 12. Important correction to prior audit conclusions

Earlier batches treated the #1–#10 authority cleanup as fully cleared. The current cross-source audit deliberately re-checks Production instead of trusting the historical claim.

The result is:

- the easy authority fixes remain architecturally correct;
- location identity data is currently clean (`places` records have valid `location_id` references);
- Partner benchmark authorization remains a security boundary that must be verified against the current deployed function definition;
- privileged RPC exposure is broader than the previous cleanup summary suggested because the Supabase advisor now identifies additional SECURITY DEFINER functions requiring classification.

Therefore **1–10 should be treated as historically resolved authority conflicts, but not as proof that the entire current Production security surface is clean.**

This distinction prevents the audit from becoming stale.

---

# 13. Previous repository interoperability

The historical `KleenestApp` audit established several requirements that remain valid:

- every actionable control needs a real handler and authoritative backend path;
- Account/Business permissions are authoritative in Supabase;
- Admin datasets must be classified mutable vs read-only;
- Business already had meaningful CRUD/analytics capabilities;
- the historical Admin UI exposed far less than the backend actually contained.

The current `Kleenest_App` has materially improved the architecture by establishing `CanonicalAppRuntime`, canonical feature routing, canonical services, and explicit interoperability matrices.

However, historical repositories remain **behavioral evidence**, not product authorities. Recover useful features and flows; do not copy their runtime architecture back into the current app.

---

# 14. Commit-level wiring strategy

After this audit, wiring should proceed by **capability slices**, not page-by-page.

For each slice, trace:

`Supabase capability`
→ `existing App service / commit`
→ `canonical domain owner`
→ `shared identity`
→ `existing UI component`
→ `CTA handler`
→ `RPC/table mutation`
→ `result/error`
→ `realtime/offline`
→ `analytics/event feedback`.

### Recommended commit groups

**Group A — Shell + membership**
- canonical workspace resolver;
- membership-aware navigation;
- brand shell;
- global notifications/search/account;
- ad/no-ad capability.

**Group B — Consumer**
- Explore/Map/Place;
- check-in/QR;
- evidence/reviews;
- favorites/routes;
- Play/Community;
- offline replay.

**Group C — Business**
- Overview;
- Locations;
- Engage;
- Intelligence;
- Analytics;
- tier gates.

**Group D — Enterprise**
- Command;
- Partners;
- Campaigns;
- Performance;
- Fleet bridge.

**Group E — Fleet**
- Operations;
- Routes;
- Performance;
- Opportunities;
- Goals + live metric values;
- notification/action loop.

**Group F — Admin**
- Control Room;
- Access/users/businesses;
- moderation/content;
- data/analytics;
- Preview workspace simulator.

**Group G — security hardening**
- RLS classifications;
- SECURITY DEFINER grants;
- fixed search paths;
- auth password protection;
- privileged worker/API boundaries.

---

# 15. UI completion standard

A feature is **not wired** because its button calls an RPC.

A feature is complete only when:

1. the user can discover it naturally;
2. the correct membership/workspace can see it;
3. the CTA is visually clear;
4. the handler validates identity/entitlement;
5. the authoritative Supabase contract executes;
6. loading/success/error states are visible;
7. resulting data is reflected without manual reload where appropriate;
8. realtime updates use realtime as delivery, not truth;
9. offline actions replay into the same authority;
10. resulting events/analytics/notifications update the downstream loop;
11. Admin Preview can exercise the capability under the relevant membership context;
12. there is no duplicate client authority.

---

# 16. Final product direction

Kleenest should feel like **one polished product with different jobs**, not a collection of database capabilities.

### Consumer

**Find → choose → go → check → contribute → play → share.**

### Business

**See → understand → engage → convert → improve.**

### Enterprise

**Connect → allocate → campaign → measure → optimize.**

### Fleet

**Operate → route → monitor → improve → act.**

### Admin

**Observe → test → control → verify → repair.**

The shared Kleenest identity, location graph, routing graph, Live Network, notification system, feedback loop and evidence/progression systems are what make these workspaces one product.

The next implementation phase should therefore **not begin by renaming pages**. It should begin by tracing the existing commits into these workspace contracts, preserving working capabilities and moving them into the right organic UI locations while replacing only duplicate/obsolete presentation layers.

This audit is the architecture gate for that work.
