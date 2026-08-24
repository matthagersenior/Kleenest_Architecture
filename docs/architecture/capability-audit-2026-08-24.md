# Capability / Interoperability Audit — 2026-08-24

## Canonical product model

### User
- Free — ads enabled
- Premium — $5 one-time ad removal / premium unlock
- Fleet — premium user capabilities plus Fleet operations
- Enterprise — user + Fleet + Enterprise-customized capabilities

### Business
- Standard — core business management
- Growth — Standard + Enterprise engagement tools
- Fleet — Growth + Fleet operations
- Enterprise — advanced analytics + Fleet capability

The runtime normalizes legacy `business` / `service_tier` values into the canonical Business model and normalizes consumer membership values into the canonical User model.

## Supabase capability clusters verified

- `ad_placements` — ad placement inventory and eligible tiers
- `subscription_plans` / `subscriptions` — billing product state
- `user_feature_entitlements` / `account_service_entitlements` — feature/tier authorization
- `feature_access_events` / `analytics_events` / `data_feature_events` — telemetry
- Fleet: alerts, drivers, vehicles, maintenance, routes, metric definitions, assignments, snapshots, operational/performance events, service opportunities
- Enterprise: networks, members, metrics, allocations, campaigns, outcomes, engagement and intelligence events
- Business: campaigns, events, contests, promotions, progression and metric analytics
- QR: attribution, intelligence, programs, redemptions
- Community/progression: badges, leaderboards, quest events, progression metrics
- Location intelligence: verification campaigns, address backfills, filter events, route events
- Notifications: delivery events and push subscriptions
- Offline: offline pack events
- Preferred/partner analytics: preferred business/usage analytics and partner usage analytics
- Geofencing/live network events

## Wiring standard

A capability is considered complete only when:

`Supabase capability -> authorization -> domain service -> UI surface -> actionable control -> mutation/query -> state refresh -> telemetry -> entitlement -> navigation`

Backend-only capabilities remain explicitly classified as UI gaps instead of being treated as completed features.

## CRUD contract

The Owner CRUD surface consumes the governed backend capability catalogue rather than maintaining an independent list of database resources. Business management exposes lifecycle controls for active business assets and links deeper editing to governed CRUD.

## Interoperability rule

Do not create duplicate data sources when an authoritative Supabase dataset/RPC already exists. New UI features must consume the canonical domain service and emit the shared telemetry/event model.

## 2026-08-24 wiring additions

- The canonical platform entitlement service is registered as `services.platformEntitlements` alongside the legacy-compatible entitlement service.
- `CapabilityGate` provides a reusable runtime authorization boundary for Business engagement, QR, Enterprise, Fleet, Fleet metrics, and quest-creator capabilities.
- Business engagement now uses the canonical platform entitlement RPCs for engagement authorization and location caps before rendering its gated program builder.
- Platform notification bulk-read and browser push registration are wired into the runtime; Fleet route notification publishing remains owned by the Fleet status service.
