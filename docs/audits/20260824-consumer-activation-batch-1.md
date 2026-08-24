# Consumer activation implementation batch 1 — 2026-08-24

## Scope

Canonical implementation target: `Kleenest_Architecture/main`.
Reference repositories are consulted only for proven behavior and parity; no new product implementation is added there.

## Batch A — canonical evidence contribution UX

### Problem found

The evidence surface exposed internal `locationId` and `checkInId` inputs directly to consumers. That made a normal contribution workflow depend on technical identifiers and allowed the UI to drift away from the canonical location context.

### Implemented

- Evidence opened without a location now explains that a canonical location must be selected instead of presenting a raw ID workflow.
- Evidence loads the canonical location through `services.locations.getById` before presenting contribution controls.
- The location field is now a read-only human-readable location context rather than an editable internal identifier.
- Authenticated users' location interaction state is loaded so the latest verified visit can be attached automatically.
- Consumers no longer need to manually enter a check-in ID.
- The UI clearly distinguishes a contribution with a verified visit from an unlinked contribution.
- Existing authoritative evidence RPCs remain unchanged: `submit_restroom_observation` and `submit_location_quality_observation`.
- Existing evidence telemetry and progression refresh remain active after successful submission.
- Authentication redirects preserve the intended evidence destination.

## Batch B — trust-game integrity

### Problem found

The tap games awarded points every time a previously discovered target was tapped again, allowing unlimited score inflation within one session. Quiz games could also cycle indefinitely through the finite question set.

### Implemented

- Tap targets can only award score once per session.
- Scored tap targets become visibly completed and are disabled.
- Quiz sessions are bounded to eight questions.
- Quiz controls disable after the session completes.
- Saved sessions cannot continue accumulating score.
- The existing authoritative `record_game_result` and challenge score RPC paths remain the only progression write paths.

## Verification requirements

- Confirm the evidence route is reachable from `LocationDetailsPage` with a canonical location ID.
- Confirm authenticated location interaction state supplies the latest check-in without manual ID entry.
- Confirm evidence submission reaches the existing RPC and returns a success result.
- Confirm telemetry/progression refresh executes after submission.
- Confirm repeated tap presses cannot increase a target's score twice.
- Confirm quiz score stops after eight questions.
- Confirm saved game sessions cannot continue modifying the submitted score.

## Commits

- `dac65f85f8f4580b40580d9bb0a44fd2ff19820e` — Consumer evidence UX canonical location binding.
- `5898f2931ec3d08594f093ff9d483b1bbec8bd7e` — Trust-game score integrity and bounded quiz sessions.

## Status

**Implemented in `main`; verification continues in the next consumer activation batch.**

Next target: verify the full `Map → Place → check-in → evidence → review → reputation/intelligence → Community` activation path and close any remaining action, refresh, or telemetry gaps before expanding into Business growth-loop work.
