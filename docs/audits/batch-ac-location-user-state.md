# Batch AC — Location user-state boundary audit

Date: 2026-08-22

## Findings

Production exposes user-specific location capabilities separately from the base location read model.

### Favorites

Supabase provides `my_favorite_locations`, `get_favorite_locations`, `location_favorite_counts`, `location_favorite_route_metrics`, and `kleenest_toggle_favorite`/favorite-route recording capabilities.

The existing app has a dedicated `favorites.js` service and a separate `locationActivity.js` service. The app therefore already treats favorite state and route/activity attribution as distinct concerns.

**Architecture decision:** favorite state is an attached user-state projection, not part of the canonical public Location identity.

### Routes

Production has separate route planning/discovery/status commands, including `create_route_plan`, `prepare_route_discovery`, `populate_route_discovery_cache`, `complete_route`, and fleet route status/notification commands.

A route references locations but is a separate aggregate. Route state must therefore not be embedded into the base LocationContract. Instead, LocationContract can expose optional route affordances or route metrics when explicitly requested.

### User location sessions

`prepare_universal_location_discovery` creates/uses user location session state. This is request/session context, not location identity. Architecture should preserve the session orchestration while preventing session fields from leaking into the canonical public Location object.

### Entitlements

`get_current_user_product_entitlements()` is a user/product capability. It should remain outside LocationContract. Entitlements may control whether a user can invoke a location capability, but entitlement state is not a property of the location itself.

## Boundary model

```text
LocationContract
  = shared location identity + public/authorized location projections

Attached capabilities
  ├─ FavoriteState(user, location)
  ├─ RouteContext(user, location, route)
  ├─ CheckInState(user, location)
  ├─ SessionContext(user, discovery session)
  └─ Entitlements(user/product)
```

This prevents a common architectural error: putting user-specific state into a supposedly canonical location object and then accidentally caching it as shared data.

## Interoperability rules

1. A cached/public LocationContract must never contain another user's favorite state.
2. Route membership is not a location attribute.
3. Entitlement decisions belong at capability authorization boundaries.
4. Discovery sessions are request context, not persistent location identity.
5. Favorite-route events remain distinct from favorite CRUD because they represent behavioral attribution.
6. Location favorite counts/route metrics may be exposed as aggregate projections, but must be distinguished from the requesting user's own state.

## Important existing app implication

The app's canonical runtime already has dedicated `favorites` and `locationActivity` services, while `AppRuntime` and Map consumers use the shared location runtime. This separation should be preserved when the new Architecture runtime is wired.

## No Production mutation

This batch only documents the authority/boundary model.
