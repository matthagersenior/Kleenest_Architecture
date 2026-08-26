# Vertical-Slice Implementation Rule

Kleenest is implemented concurrently across three product surfaces:

- Consumer mobile
- Business mobile (optional companion for businesses)
- Web (required for both consumer and business workflows)

A capability is not complete when its database object, service, or screen exists independently. Completion requires the full vertical slice:

capability → canonical data/RPC → authorization/RLS → shared/domain service → application state/context → route → visible control → click/tap handler → real query/mutation → resulting fact → UI refresh/state → downstream event/notification/analytics → automated validation.

## Surface parity

Every capability in the interoperability matrix must be classified as:

- Primary: full operational UI on the surface.
- Supported: operational UI sufficient to complete the workflow, even if not the preferred surface.
- Not applicable: intentionally absent with an architecture/documentation reason.

"Coming soon", static cards, navigation-only links, or handlers that stop before a real canonical operation do not count as implemented.

## Business web requirement

Business Web is a first-class operational product. No core business workflow may require the Business mobile app. Mobile is an optional companion for field/on-site workflows.

## Consumer choice

Consumer users may complete supported workflows through Consumer mobile or Web. Account state and resulting canonical facts must remain interoperable between them.

## AI rule

Semantic AI may interpret intent, summarize canonical evidence, explain results, and recommend next actions. It must never become the source of truth for location, cleanliness, accessibility, occupancy, verification, pricing, promotion, or business claims.

## Execution rule

Implement vertical slices in meaningful batches. Reuse existing canonical services and RPCs before adding new backend capabilities. Do not weaken security to make a UI operation succeed. If a surface is missing, build it concurrently rather than deferring parity until the mobile products are finished.