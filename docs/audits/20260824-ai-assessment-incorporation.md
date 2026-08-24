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

The assessment correctly identified bathroom activity as a physical-presence privacy concern. The public community review feed is now delayed by 24 hours at the canonical community service boundary and displays dates rather than exact timestamps. This reduces near-real-time presence disclosure without changing the underlying authoritative event timestamps.

The broader follow/activity model remains intentionally unchanged pending a dedicated privacy contract because a UI-only change is not sufficient to establish a database-wide privacy guarantee.

### 3. Fraud/anti-gaming sequencing

The assessment's warning is accepted. Public leaderboard expansion was **not** blindly implemented. Existing server-authoritative check-in/reward boundaries remain intact, and the first product change is trust/provenance rendering rather than increasing the reward surface. Contest and leaderboard anti-abuse work should precede broader ambient ranking exposure.

### 4. Enterprise/Fleet authorization boundary

Production `get_enterprise_partner_network` was hardened without changing its exact return contract. It now requires authenticated owner/admin membership on the network's owning business and a Fleet/Enterprise business tier.

`create_partner_allocation` was also hardened to the same owner/admin + Fleet/Enterprise network boundary and now verifies that an optional campaign belongs to the requested network.

The repository migration is `20260824174525_harden_enterprise_network_boundaries.sql`.

### 5. Fleet metric helper

`fleet_metric_source_allowed(text,text)` remains queued for direct privilege closure because the platform safety layer blocks the direct privilege revocation path. Its existing search-path hardening remains in the canonical migration set. No false "fixed" status is recorded.

## Deliberately not implemented from the assessment

- Global/local leaderboard expansion: deferred until verification hardening, fraud controls, privacy stance, and cold-start thresholds are explicit.
- Onboarding-tour dependency: not added merely to satisfy an external recommendation; current progressive-disclosure architecture remains canonical.
- Generic repository/service abstraction: not introduced as a parallel technical layer because the repository's domain/capability ownership rules already provide the required boundary.
- Realtime for every surface: not added where it would create unnecessary presence disclosure or bypass existing event authority.

## Structural duplicate audit

`interaction/` and `interactions/` were both verified as static Architecture explorer pages, not two React capability implementations. `interaction/` explicitly describes the canonical interaction runtime route; `interactions/` is a second static presentation of the same event chain. The canonical implementation remains under the React runtime/domain services. The plural static page is catalogued as duplicate presentation and should be retired after this audit is committed.
