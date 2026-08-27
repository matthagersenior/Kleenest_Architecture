# Supabase + Ingestion + AI + Workspace Audit — 2026-08-27

## Scope

Reviewed the live Production Supabase capability graph, public grants for the affected domains, ingestion primitives, Intelligence primitives, Fleet operations, and the membership-workspace implementation.

## Findings

### 1. Intermittent production permission errors

The strongest current failure mode is contract mismatch, not missing capability.

Production exposes authenticated `SELECT` on several Fleet fact tables, while Fleet mutations are exposed through authenticated RPCs. The ingestion RPCs (`ingest_external_locations`, `ingest_osm_locations`, `merge_external_location_metadata`) are service-role/Postgres execution boundaries rather than ordinary authenticated client writes.

Therefore:

- protected writes must not fall back to direct table writes;
- UI services must fail through the canonical RPC/Edge Function boundary;
- capability gates must distinguish `loading`, `locked`, `denied`, and `backend failure` instead of turning a transient authorization/backend error into a permanent tier lock;
- session refresh and entitlement refresh must be treated as first-class state transitions.

`CapabilityGate` currently converts any RPC exception into `allowed=false` and displays the same locked state used for a genuine entitlement denial. This can make intermittent permission/network/RPC failures look like missing membership. The next slice must separate **locked** from **verification error** and provide retry/session-refresh behavior.

### 2. Public-data ingestion is already architecturally possible

Production already has:

- `external_data_sources`
- `external_data_datasets`
- `external_location_records`
- `external_observations`
- `external_import_jobs`
- `location_ingestion_jobs`
- `location_sources`
- `ingest_external_locations(source_key, rows)`
- `ingest_osm_locations(rows)`
- `resolve_location_external_identity(...)`
- `merge_external_location_metadata(...)`
- `search_public_data_catalog(query, limit)`
- `prepare_universal_location_discovery(...)`
- public-data Edge Function generations, including a Data.gov-specific ingest function

This means Data.gov should **not** become a second location system. It should become another source adapter feeding the same canonical ingestion/identity pipeline.

### 3. Data.gov / public source contract

Canonical flow:

`source catalog → dataset discovery → source-specific fetch → normalized candidate → external identity → canonical location resolution → merge/enrichment → conflict/freshness scoring → canonical location → map/discovery → intelligence`

Each source record should retain:

- source key
- dataset identifier
- external record identifier
- landing/resource URL
- publisher
- license metadata
- source timestamp/version where available
- raw source metadata
- normalized name/address/category/coordinates
- ingestion job identifier
- confidence/provenance

The resolver must use source identity first and geographic/name identity second. A new physical location is inserted into canonical `locations`; an existing location is enriched rather than duplicated. All downstream behavior then follows the same location rules as OSM.

### 4. Source families to support

First-class adapters should cover:

- OSM
- Data.gov
- federal open-data APIs/catalogs discoverable through Data.gov
- state open-data portals
- county/city open-data portals
- public transportation/municipal datasets when spatially relevant
- other openly licensed public datasets that expose stable geographic identifiers

Source adapters must normalize into one ingestion contract. They must not create source-specific frontend services or source-specific location tables.

### 5. Intelligence expansion opportunities

The live backend already exposes a strong closed-loop substrate:

`canonical facts → analytics → recommendation/action link → execute → complete → jobs/notifications → outcome`

Available building blocks include location trust/confidence, location recommendation summaries, business growth actions, Fleet service opportunities/metrics, Enterprise network analytics, notification jobs, data-feature events, action links, action execution/completion, and action-job processing.

High-value AI/Intelligence expansions should therefore focus on:

- source reconciliation and conflict explanation;
- location freshness prediction;
- trust/confidence explanation;
- anomaly detection across location quality and Fleet operations;
- recommended verification targets;
- business growth opportunity ranking;
- Fleet maintenance/service opportunity prioritization;
- enterprise partner allocation recommendations;
- notification prioritization and deduplication;
- natural-language explanation of canonical analytics;
- action recommendation with explicit evidence and reversible/authorized execution.

AI must remain a derived decision-support layer. It must never become the canonical store for location, membership, Fleet, financial, or engagement facts.

### 6. Supabase capabilities to combine

The strongest combinations are:

- Postgres/RPC authority + Edge Functions for external HTTP ingestion.
- External source catalog + location identity resolver + conflict records for multi-source reconciliation.
- PostGIS/location proximity + canonical discovery for spatial source merging.
- `pg_cron`/scheduled workers where appropriate for recurring source refresh and intelligence jobs.
- Realtime for delivery/invalidation only.
- Storage for source artifacts/raw evidence where policy permits.
- Database functions for deterministic scoring, entitlement, identity and transactional mutations.
- Intelligence action links/jobs for AI-to-operator closure.
- Data-feature events + analytics for measuring whether recommendations create value.

## Fleet completeness target

Fleet already has canonical CRUD for vehicles, drivers, routes, maintenance, alerts, operational events, metric definitions, assignments, metric values and leaderboards. The Fleet operator target is:

`Command → Vehicles → Drivers → Routes → Service Opportunities → Maintenance → Alerts → Performance → Goals/Metrics → Notifications → Outcomes`

The current UI exposes most of this through Fleet Operations and Fleet Performance. Remaining work is to ensure every action has the same authorization, loading/error distinction, authoritative refresh, audit/telemetry, and no duplicate controls across routes.

## Membership UI audit target

Every membership tier must be audited at the control level, not page level.

For each button/link/control record:

`workspace → surface → control label → intended capability → route → service method → backend RPC/Edge Function → entitlement → authorization → success state → failure state → refresh → telemetry`

Flag:

- duplicate controls that invoke the same action;
- conflicting labels for the same capability;
- dead routes;
- no-op buttons;
- links to technical/JSON surfaces where a normal operator should have a human workflow;
- controls shown when entitlement is absent;
- controls hidden when entitlement is present;
- style variants that contradict the shared workspace grammar;
- destructive actions lacking confirmation;
- mutations without authoritative refresh;
- action failures rendered as entitlement locks.

## Large-slice implementation plan

### Slice A — Permission/Error Boundary

Separate `locked`, `unauthorized`, `session-refresh-required`, `backend-error`, and `network-error` states. Add retry and entitlement/session refresh. Audit all production workspaces for direct-table writes and mismatched RPC contracts.

### Slice B — Universal Public Ingestion

Create one canonical source registry/adapter contract. Add Data.gov as a source adapter using the existing public-data catalog and ingest infrastructure. Reuse the OSM normalization/resolution/merge path. Add job status, provenance, external identifiers, conflict handling and idempotency.

### Slice C — Multi-source Location Intelligence

Combine source agreement, freshness, conflicts, observations, verification and reviews into a trust/freshness model. Surface explanation and evidence rather than opaque scores.

### Slice D — Intelligence Operating System

Expose recommendation feeds by workspace. Business gets growth actions; Fleet gets operational opportunities; Enterprise gets network/allocation opportunities; Owner gets platform anomalies and ingestion health. Every recommendation gets evidence, action type, authorization and outcome tracking.

### Slice E — Fleet Owner Operating Completeness

Unify Operations and Performance navigation, eliminate duplicate status controls, add driver/vehicle/route detail workflows, maintenance scheduling/completion, alert resolution, service opportunity actioning, goals/metric configuration, notifications and outcome history.

### Slice F — Membership UI Control Audit

Inventory every control across Consumer, Premium, Fleet User, Enterprise User, Business Standard, Growth, Fleet and Enterprise presentations. Reconcile duplicates, conflicting routes, styles, capability gates and dead actions. Add automated static checks where possible and representative runtime smoke checks for each membership.

### Slice G — Cross-tier Interoperability

Verify that shared facts created in one workspace become correctly available downstream: location ingestion → consumer discovery → Business intelligence → Fleet opportunity → Enterprise analytics → Owner governance, without duplicated state.

### Slice H — Production Verification

Run the canonical audit runner, failure-path audit, authorization audit, build, Pages deployment, representative authenticated workspace checks and ingestion dry runs. Promote only after the complete chain is demonstrably reachable.

## Definition of done

A slice is complete only when:

`source/fact → canonical identity → backend contract → entitlement → authorization → service → UI control → mutation/query → authoritative state → refresh → telemetry → downstream consumer`

is traceable and tested.
