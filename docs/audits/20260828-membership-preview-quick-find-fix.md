# Membership Preview Quick Find Fix — 2026-08-28

## Finding
`Home.jsx` intentionally renders `QuickRestroomActions.preview.jsx` for the membership preview surface. The preview implementation still required browser geolocation and used a non-discovering nearby query before attempting discovery. That made owner previews—especially Free Consumer—appear to have functional Quick Find controls while failing to produce a route when preview data was not already cached at the browser location.

## Fix
- Detect `previewMode` from `AppContext`.
- Preview Quick Find uses the deterministic presentation location instead of requiring device GPS.
- Preview nearby lookup enables discovery on the first query.
- If the first query is empty, the existing discovery service is attempted and the authoritative nearby query is retried.
- Preview routes are marked `presentation=1` so downstream UI can preserve preview semantics.
- Empty preview results produce an explicit diagnostic rather than silently doing nothing.

## Contract
Free and Premium are supposed to share the complete consumer experience. Membership preview must therefore exercise the same Quick Find surface rather than a dead/mock-only version.

## Commit
`1b2b07ad968a5350205f907e9f89b3cb504ba771`

## Verification
Repository source was re-read after the write. Runtime/browser verification remains required against the deployed build; no deployment is claimed by this audit.
