# Fleet Metric Interoperability Contract

Date: 2026-08-22

## Purpose

Fleet controller metrics are a configuration layer over existing capabilities. The adapter must expose those capabilities without creating competing measurement, routing, notification, live-network, quality, or progression systems.

## Canonical flow

`Fleet operational facts`
-> `Fleet performance facts / snapshots / scorecards`
-> `Fleet Metric Adapter`
-> `controller goal / threshold / scoring / scope`
-> `Fleet analytics read model`
-> `controller action`
-> `authoritative mutation or notification`
-> `new event`
-> `refreshed measurement`

## Interoperability graph

### Live Network

Existing `live_network_events` is an event stream and realtime delivery mechanism. Fleet metrics may consume event volume or correlate operational facts with live activity. The adapter must never reinterpret realtime delivery as authoritative state.

Existing Fleet UI already subscribes to the canonical live network stream and refreshes operational intelligence from `fleet.*` events. The application reference explicitly uses this path for Fleet Review. fileciteturn98file0L2-L2

### Routing and cached discovery

`route_plans`, `route_stops`, `route_events`, route discovery sessions/cells/locations, and discovery caches remain Route/Maps-owned. Fleet metrics can reference route completion, stop volume, route events, or route opportunity signals, but Fleet must not create a second route/discovery cache.

### Notifications

Notifications remain platform infrastructure:

`metric/operational signal`
-> `notification event`
-> `materialized notification`
-> `delivery`
-> `user/controller action`

Fleet route notification publishing already exists through `publish_fleet_route_notification()`, and the reference Fleet/Enterprise service calls that canonical RPC rather than persisting a parallel notification object. fileciteturn99file0L2-L2

### Feedback and Quality

User feedback, review amenity feedback, and location quality observations can become downstream measurement inputs. They remain owned by Quality/Feedback/Maps. A Fleet metric may correlate against them, but must not copy the underlying feedback into Fleet.

### Enterprise / Partner Network

Enterprise partner network metrics remain enterprise-owned analytics. Fleet can consume appropriate aggregates for controller analytics or network context; it must not rewrite partner outcomes as Fleet facts.

### Progression / Gamification

The shared progression framework remains reusable for configurable metric events, targets, challenges, games, summaries, and leaderboards. However, Fleet operational facts are not user-reward events by default.

The adapter therefore distinguishes:

- **measurement:** existing Fleet operational/performance facts;
- **controller scoring:** Fleet metric definition/goal/threshold configuration;
- **progression:** optional downstream use when a configured metric explicitly maps to progression semantics;
- **leaderboard:** downstream projection, never a second source of truth.

The existing Architecture audit confirms this two-layer boundary and specifically warns against forcing raw Fleet facts into gamification semantics. fileciteturn103file0L2-L2

## Source catalog

The companion migration `20260822013000_fleet_metric_interoperability_catalog.sql` exposes a read-only capability catalog through `get_fleet_metric_capabilities(business_id)`.

The catalog includes existing source families such as:

- Fleet metric snapshots
- Fleet driver scorecards
- Fleet performance events
- Fleet operational events
- Live Network events
- Route events/stops
- Location quality observations
- User/review feedback
- Enterprise partner network metrics

It also identifies interoperable downstream capabilities such as routing, notifications, feedback, live network, progression, and leaderboards.

## Controller experience

The controller UI should therefore be built from the capability catalog rather than hard-coded metric choices.

Configuration sequence:

1. Resolve business and Fleet entitlement.
2. Load Fleet metric capabilities.
3. Select an existing measurement source.
4. Select supported aggregation/unit/scope.
5. Define goal/threshold/direction.
6. Select scoring method.
7. Assign to fleet/team/driver/vehicle/route.
8. Save through the server-authoritative Fleet metric RPC.
9. Render current measurement and score from canonical read models.
10. Trigger notifications/actions through existing platform contracts when policy says action is warranted.

## Example

A controller creates:

`Route completion >= 95%`

Source:
`fleet_metric_snapshots.routes_completed`

Scope:
`fleet`

Period:
`week`

Scoring:
`threshold`

Downstream interoperability:

- route events provide operational context;
- Live Network can surface current route activity;
- Fleet intelligence can produce opportunities/attention;
- notification infrastructure can alert the controller;
- leaderboards can project the resulting score where appropriate;
- progression can consume it only if explicitly configured as progression activity;
- feedback can be correlated with route/location quality.

No new route table, notification table, event stream, leaderboard table, or progression engine is created for this metric.

## Non-negotiable rules

- Realtime is delivery, not source of truth.
- Cached routes are cache state, not route authority.
- Notifications are events/delivery infrastructure, not metric storage.
- Feedback is evidence, not Fleet operational fact.
- Enterprise analytics is not Fleet-owned fact storage.
- Leaderboards are projections.
- Progression is optional downstream semantics.
- Fleet operational tables remain authoritative for Fleet state.
- Controller configuration never mutates the source measurement.
- Every metric must reference a known capability from the catalog.

## Implementation gate

The adapter is now sufficiently connected conceptually to the existing Supabase capability graph. The next implementation step is application wiring: expose the capability catalog and Fleet metric configuration through the canonical runtime, then add the controller configuration/read surfaces while consuming existing Fleet dashboards, live network, route, notification, feedback, and progression services.
