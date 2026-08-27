# Interoperability Expansion Matrix — 2026-08-27

## Authority

`Supabase Production → canonical RPC/data model → Architecture domain service → AppContext → workspace UI → action → resulting fact → analytics/intelligence`.

## Newly confirmed production capabilities

| Domain | Canonical capabilities | Expansion |
|---|---|---|
| Public ingestion | external sources/datasets/records/jobs, OSM ingest, generic external ingest, Data.gov-specific Edge Function, public catalog search | One universal source-adapter pipeline |
| Location identity | external identity resolver, metadata merge, canonical locations, source/provenance records | Multi-source dedupe/enrichment |
| Location intelligence | confidence, recommendation summary, bathroom intelligence, observations, verification campaigns | Trust/freshness/explanation layer |
| Intelligence | action links, execute, complete, action jobs, notifications | Workspace-specific recommendation/action loop |
| Fleet | vehicle/driver/route CRUD, maintenance, alerts, operational events, metrics, scorecards, leaderboards | Full fleet-owner operating loop |
| Notifications | event publication, materialization, delivery queues, push subscriptions | Prioritized action delivery |
| Analytics | data feature events, engagement attribution, ROI/benchmarks | Outcome measurement |
| Governance | admin authorization, CRUD gateway/catalog, integrity summaries, activity audit | Operator-safe control plane |

## Ingestion interoperability contract

`OSM/Data.gov/public source → source record → external identity → canonical location → merge/conflict → freshness/confidence → canonical discovery → downstream product behavior`.

No source owns a second location model. The canonical `locations.id` remains the cross-product identity.

## Permission boundary finding

Fleet fact tables expose authenticated reads while mutations are provided through Fleet RPCs. Ingestion RPCs are not ordinary authenticated client writes; they are service-role/Postgres boundaries. Client services must therefore use canonical RPC/Edge Function paths for protected mutations.

The UI must distinguish a genuine entitlement lock from an RPC/session/network failure. A backend exception must not automatically become a membership lock.

## AI/interoperability opportunities

AI can safely sit downstream of canonical facts for:

- multi-source conflict resolution suggestions;
- freshness prediction;
- trust/confidence explanation;
- anomaly detection;
- verification-target prioritization;
- Business growth opportunity ranking;
- Fleet maintenance/service prioritization;
- Enterprise allocation recommendations;
- notification prioritization;
- natural-language analytics explanation.

AI output must become a recommendation/action record with evidence, authorization, action type, and measurable outcome. AI does not replace authoritative domain state.

## Fleet contract

`business → Fleet authorization → vehicles/drivers/routes → operations → maintenance/alerts → performance/metrics → goals → intelligence → notification → outcome`.

The Fleet workspace must expose all operator-critical actions without forcing users into Owner/admin controls or technical JSON.

## Membership UI contract

Every membership control is audited against:

`control → capability → route → service → backend contract → entitlement → authorization → success/failure → refresh → telemetry`.

A duplicate or dead control is a wiring defect, not merely a visual defect.

## Large implementation slices

1. Permission/error-state hardening.
2. Universal public-data ingestion/Data.gov adapter.
3. Multi-source location identity/conflict/freshness intelligence.
4. Intelligence recommendation/action/outcome operating system.
5. Fleet owner operating completeness.
6. Full membership control/visual audit.
7. Cross-workspace interoperability verification.
8. Production audit/deployment verification.
