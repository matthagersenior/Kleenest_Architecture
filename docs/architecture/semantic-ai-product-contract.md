# Semantic AI Product Contract

## Objective
Add semantic search and assistance to Kleenest without creating a second source of truth.

## Contract
User language -> semantic interpretation -> canonical filters/intent -> canonical location discovery -> trust/ranking -> UI result.

AI may interpret intent, summarize evidence, explain recommendations, and suggest next actions. AI may not invent locations, cleanliness, accessibility, opening status, occupancy, verification, prices, promotions, or business claims.

## Initial semantic intents
- restroom / bathroom / washroom discovery
- accessibility / wheelchair
- changing table / family needs
- amenities
- cleanliness / trust
- distance / nearby
- route-oriented requests
- business discovery and engagement (Business product)

## Current implementation
`public.semantic_location_search` provides an authenticated, deterministic canonical contract and records normalized queries. It is intentionally `semantic_mode=deterministic-canonical` and `ai_ready=true`.

This is a safe bridge: an AI interpreter can later produce the same `interpreted_filters` contract without changing the authoritative result layer.

## UI rule
Semantic search belongs in the Consumer map/search experience and may be surfaced as natural-language search. It should not expose internal capability registries.

## Trust rule
Every AI-derived statement about a location must be traceable to canonical fields and should distinguish observed facts from estimates/predictions.

## Product value
Consumer: natural-language discovery and better decisions.
Business: natural-language growth recommendations and explanation of health/engagement metrics.
Platform: one canonical data graph with an AI interpretation layer, not an AI-owned database.
