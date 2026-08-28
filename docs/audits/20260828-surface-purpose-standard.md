# Surface Purpose Standard — 2026-08-28

## Rule
Every visible interactive surface must have a justified purpose. Every button must produce an intentional, observable outcome or be explicitly disabled with a reason. Every navigation surface must resolve to a meaningful destination.

## Verification chain
UI surface → action/route → runtime handler → canonical service → RPC/Edge Function → authorization → database/external effect → state refresh → user-visible result.

## Status vocabulary
- `wired`: full chain verified
- `partial`: chain exists but one or more layers are incomplete
- `orphaned`: surface has no meaningful destination/action
- `duplicate`: materially duplicates another surface without a distinct purpose
- `miswired`: action exists but targets the wrong contract/surface
- `blocked`: intentionally unavailable and explains why
- `stale`: points to removed/replaced capability
- `unverified`: structural wiring exists but effect has not been verified

## Enforcement
`scripts/surface-purpose-audit.mjs` is part of `npm run audit` and scans the source tree for buttons lacking an observable action. This is a structural gate, not proof of business correctness; human/runtime verification remains required for `wired`.

## Product rule
Do not add UI merely because backend capability exists. Do not keep UI merely because it looks useful. A surface earns its place by completing a user task or providing necessary navigation/context.
