# Batch AB — Location retrieval-path matrix

Date: 2026-08-22

## Production retrieval paths

| Path | Purpose | Strength | Limitation | Architecture role |
|---|---|---|---|---|
| `nearby_locations` | lightweight geographic discovery | simple, fast core location result | no amenities/fixtures/verification detail | low-level proximity primitive |
| `nearby_locations_enriched` | map/discovery proximity with amenities and fixtures | richer canonical location payload | still lacks verification/confidence projections and user/session context | enrichment primitive |
| `prepare_universal_location_discovery` | shared session-aware discovery | creates discovery session; returns core verification, bathroom, quality, rating and provenance fields; supports external-discovery fallback signal | does not include amenities/fixtures, confidence projections, intelligence data, or favorite/user state | strongest candidate for shared discovery orchestration, not complete LocationContract |
| `business_location_detail` | business-owned location analytics/detail | business-scoped and includes check-ins/visitors/reviews | not a general location read; authorization/business scope | business-domain read model |
| `business_location_intelligence` | business intelligence | consumes `location_intelligence_snapshot` plus feature events; exposes demand/behavior metrics | business-only analytics, not discovery/location identity | intelligence read model |

## Key conclusion

There is no single existing Production RPC that should be promoted wholesale to the Architecture `LocationContract`.

The existing functions are intentionally specialized:

- proximity (`nearby_*`)
- universal discovery orchestration (`prepare_universal_location_discovery`)
- business analytics (`business_location_*`)

Architecture should therefore use a **composed read model**, with a canonical normalized location identity and explicitly attached projections.

## Recommended composition

```text
locations
  + nearby/enriched proximity
  + verification projections
  + amenity/fixture projections
  + intelligence snapshot (when authorized/needed)
  + user-specific state (favorite, route, entitlement) when requested
       ↓
Canonical LocationContract
       ↓
Map / Place / Business / Fleet / Route / Social / Intelligence
```

The composition must not turn business analytics into public location data. Authorization boundaries remain attached to each projection.

## Important implementation detail

`prepare_universal_location_discovery` already returns a `data_policy` (`universal_discovery_v1`) and records a `user_location_sessions` row. That makes it more than a plain SELECT: it is an orchestration command plus a discovery read. Architecture should wrap it as such rather than duplicating its session behavior.

`nearby_locations_enriched` remains valuable because it provides amenities and fixtures efficiently. It should be treated as a read primitive feeding the normalized contract, not replaced just because universal discovery exists.

## Consumer implications

Map should consume the normalized contract rather than independently selecting between `nearby_locations`, `nearby_locations_enriched`, and `prepare_universal_location_discovery` based on UI state.

Business should retain its authorized intelligence/detail projections because those contain business-only analytics and demand signals that should not be merged into the public discovery payload.

## No schema changes yet

Do not modify `prepare_universal_location_discovery` until the Architecture contract explicitly specifies:

1. required public location fields,
2. optional enrichment fields,
3. user-specific fields,
4. privileged/business-only fields,
5. evidence/provenance fields,
6. verification/confidence semantics,
7. freshness/source semantics.

No Production mutation was performed.
