# 2026-08-29 Cluster Execution State

## Protected baseline
The current application state remains the protected baseline. Cluster work must converge existing implementations rather than create parallel feature-specific authorities.

## Active implementation graph

### Wave 1 — Authority Foundation
- Identity / authorization / entitlements
- Canonical location authority
- Address and source provenance
- Complete OSM/Overpass tags and raw payload retention
- Amenities / evidence / quality / trust

### Wave 2 — Network Experience
- Discovery / search / MapLibre
- Location details
- Route destination and waypoint resolution
- Consumer waypoint ordering
- Fleet dispatch ordering lock

### Wave 3 — Operating Layer
- Business locations
- QR Studio / branding / attribution
- Business engagement and campaigns
- Fleet operations
- Enterprise network

### Wave 4 — Intelligence
- Authoritative event stream
- Business intelligence
- AI analysis and recommendations
- Custom notification policy
- Notification delivery
- Action/task handoff

## Compatibility rule
A cluster is implemented as one vertical slice when its services share authoritative identifiers, events, RPCs, or data projections. Do not split compatible work into isolated UI fixes unless required to unblock the slice.

## Location contract
All downstream location consumers should use canonical location identity and preserve:
- coordinates
- normalized address
- source/source dataset
- external source identifiers
- complete source records
- raw source payload
- OSM tags
- provenance
- amenities
- quality/conflict state
- evidence/trust
- intelligence

## Business intelligence contract
Business events from locations, QR, reviews, campaigns and engagement should converge into intelligence before being exposed as AI recommendations or custom notifications. Notifications must remain governed by business role/entitlement and produce an auditable event/action trail.

## Production gate
A backend cluster is not marked complete until its Supabase migrations/RPCs/RLS have been applied and verified, the frontend consumers compile, CI passes, and the production path is smoke-tested.

## Next execution target
Continue the Business Event → Intelligence → AI → Notification → Action cluster while completing remaining Location Authority consumers. Avoid unrelated feature work unless it is a dependency or CI/production blocker.
