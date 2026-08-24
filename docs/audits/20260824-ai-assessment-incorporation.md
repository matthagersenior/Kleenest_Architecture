# AI assessment incorporation — 2026-08-24

## Source reviewed

The attached multi-assessment review was treated as advisory input, not as authoritative architecture. Its strongest recommendations were reconciled against the canonical repository rules and Production capability boundaries.

## Incorporated

### 1. Trust must be visible, not only scored

Implemented in the canonical consumer/community surfaces:

- Community review data now carries `verified` provenance from the canonical `check_in_id`.
- Public community review data also carries contributor reputation fields from `contributor_reputation`.
- Social review cards now render a verified-visit indicator, verification level/reputation score, and verified-check-in count when available.
- The existing server-authoritative progression/reputation model remains the source of truth; the client only renders read data.

The location-details service was also extended so review read models expose the same provenance/reputation data for the place/review trust surface.

### 2. Privacy before ambient social presence

The assessment correctly identified bathroom activity as a physical-presence privacy concern. The product privacy window is **1 hour**, not 24 hours. Canonical public live-network reads are delayed by one hour while authoritative event timestamps remain intact. This is the minimum practical delay selected for the current product behavior and should be treated as the active privacy contract unless a later privacy review changes it.

### 3. Fraud/anti-gaming sequencing

The assessment's warning is accepted. Public leaderboard expansion was **not** blindly implemented. Existing server-authoritative check-in/reward boundaries remain intact, and the first product change is trust/provenance rendering rather than increasing the reward surface. Contest and leaderboard anti-abuse work should precede broader ambient ranking exposure.

### 4. Enterprise/Fleet authorization boundary

Production `get_enterprise_partner_network` was hardened without changing its exact return contract. It now requires authenticated owner/admin membership on the network's owning business and a Fleet/Enterprise business tier.

`create_partner_allocation` was also hardened to the same owner/admin + Fleet/Enterprise network boundary and now verifies that an optional campaign belongs to the requested network.

### 5. Fleet metric helper

`fleet_metric_source_allowed(text,text)` remains queued for direct privilege closure because the platform safety layer blocks the direct privilege revocation path. Its existing search-path hardening remains in the canonical migration set. No false "fixed" status is recorded.

## 2026-08-24 production/UI batch incorporated

### Map: location-driven population

The map is now explicitly GPS-first. On successful browser location acquisition it runs external nearby discovery around the actual coordinates before querying the canonical Supabase network, then renders the returned locations centered on the user's position. The bootstrap path performs the same external discovery before its universal discovery read. The map no longer silently falls back to the St. Louis default center when location permission is denied; it reports the permission state and asks the user to enable location instead.

This preserves the canonical Supabase location model while fixing the missing propagation step between user coordinates → external discovery → canonical locations → map markers.

### Routes: live-network publication boundary

The observed route failure was traced to `publish_live_network_event` inserting into `live_network_events` through an invoker-security function while the table requires an authenticated actor boundary. The production function was converted to `SECURITY DEFINER`, constrained to `auth.uid()` as the actor, and its execute grant was restricted to `authenticated`. The exact route payload contract remains unchanged.

### Play: capability/service mismatch

`ProgressionPage` was already calling dashboard, summary, leaderboard, contest, challenge, badge, milestone, reward-history, contest-join, and badge-evaluation methods that the underlying progression service did not expose. The service is now wired to the existing authoritative Supabase RPCs/tables for those methods. This removes the UI→service dead end without creating a parallel gamification implementation.

### Workspace UX

The workspace shell now presents a consistent, membership-aware quick-action rail for Consumer, Business, Fleet, Enterprise, and Owner Control. High-value workflows are visible without requiring users to infer routes or use JSON. Owner Control explicitly highlights **Platform CRUD** as a first-class action alongside platform overview, audit, and security/maintenance. Existing section navigation remains available underneath the quick-action layer.

## Interoperability status after this batch

| Surface | UI | Client service | Supabase contract | Result |
|---|---|---|---|---|
| Map GPS → discovery | wired | wired | external ingest + nearby/prepare RPCs | **closed** |
| Route build → live event | wired | wired | `publish_live_network_event` | **closed** |
| Play → progression data | wired | wired | gamification/progression RPCs + governed tables | **closed** |
| Owner → Platform CRUD | highlighted | existing owner service | admin CRUD gateway | **closed at navigation layer; continue action-by-action audit** |
| Fleet metric helper | hidden/read surface | wired | helper privilege closure | **queued** |
| Enterprise partner network | wired | wired | owner/admin + Fleet/Enterprise boundary | **hardened** |

## Deliberately not implemented from the assessment

- Global/local leaderboard expansion: deferred until verification hardening, fraud controls, privacy stance, and cold-start thresholds are explicit.
- Onboarding-tour dependency: not added merely to satisfy an external recommendation; current progressive-disclosure architecture remains canonical.
- Generic repository/service abstraction: not introduced as a parallel technical layer because the repository's domain/capability ownership rules already provide the required boundary.
- Realtime for every surface: not added where it would create unnecessary presence disclosure or bypass existing event authority.

## Structural duplicate audit

`interaction/` and `interactions/` were both verified as static Architecture explorer pages, not two React capability implementations. `interaction/` explicitly describes the canonical interaction runtime route; `interactions/` is a second static presentation of the same event chain. The canonical implementation remains under the React runtime/domain services. The plural static page is catalogued as duplicate presentation and should be retired after this audit is committed.
