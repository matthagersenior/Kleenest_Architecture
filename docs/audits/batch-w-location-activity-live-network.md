# Batch W — Location activity, favorites, and live-network audit

Date: 2026-08-22

## Findings

### Favorites

`src/services/favorites.js` directly upserts/deletes `location_favorites`. Adding a favorite then invokes `recordFavoriteRouteEvent()`; removal does not invoke an equivalent route event. This is a semantic distinction: favorite state and favorite-originated route/navigation are separate facts.

### Location activity

`locationActivity.js` routes visits, observations, route events, and favorite-route events through dedicated Supabase RPCs rather than direct table writes.

Classification:
- `record_location_visit` — server command; preserve downstream event semantics.
- `record_location_observation` — server command; evidence pipeline.
- `record_location_route_event` — server command; activity/route signal.
- `record_favorite_route_event` — server command; specialized route attribution.

### Feature-event authority

Production has 12 tables using `_kleenest_capture_feature_event`. Feature-event capture is cross-cutting server infrastructure, but not every client-originated behavioral event is necessarily covered by those triggers.

`record_data_feature_event` is a real authenticated database writer. Its deduplication key uses user, event type, source/location, value text, and the current minute, then inserts a valid feature event with confidence 1.0. It must therefore be treated as a data-authority capability, not disposable UI analytics.

### Intelligence notification publication

`publish_intelligence_location_event` is a composite location-notification capability: it creates/upserts a nearby notification event, resolves nearby recipients, creates in-app and push deliveries, materializes the notification, and queues push delivery.

`publish_location_notification` is a lower-level notification-event writer. Architecture must distinguish it from the higher-level intelligence publisher so callers do not accidentally bypass recipient resolution, materialization, or delivery.

## Architecture decisions

1. Favorite state and favorite-route attribution remain separate facts.
2. Location activity commands remain RPC-first.
3. `record_data_feature_event` must be classified by event type/source before use.
4. Intelligence notification publication is a composite server capability.
5. Low-level notification-event creation must not substitute for the full intelligence publisher unless the caller explicitly owns downstream delivery/materialization.
6. A missing trigger does not imply an event is optional; some behavioral events are intentionally client-originated.

## Wiring risks

- Direct `location_favorites` writes bypass a unified RPC capability boundary and should eventually be normalized through Architecture if RLS/trigger semantics permit.
- `addFavorite()` produces a favorite-route event while `removeFavorite()` does not. This asymmetry requires explicit product semantics, not automatic cleanup.
- Multiple notification publishing primitives create a potential bypass path around recipient resolution and delivery.

No Production mutation was performed.
