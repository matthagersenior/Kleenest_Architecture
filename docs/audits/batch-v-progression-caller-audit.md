# Batch V — Progression metric caller audit

Date: 2026-08-22

## Scope

Trace every currently discoverable GitHub caller of `recordProgressionMetric` / `record_progression_metric_event`, then compare the call against the live Supabase reward and trigger graph.

## Confirmed callers

### 1. Contest submission — duplicate reward path

`src/services/contests.js` imports `recordProgressionMetric` from `services/rewards` and calls it immediately after `submit_contest_entry` with metric `contest_entry`, source type `contest`, and the contest ID.

The live `record_progression_metric_event` function is reward-capable: when the corresponding `progression_actions` row is enabled, it calculates points and calls `record_gamification_activity(metric, source_id)`.

The live `contest_entries` table also has an AFTER INSERT trigger `gamification_contest_entries` that executes `gamification_activity_trigger()`.

Therefore a normal contest submission can enter the same gamification activity through both the table trigger and the client follow-up progression metric.

**Classification: CONFIRMED DUPLICATE REWARD PATH.**

The database trigger should remain the authoritative contest-entry reward path. If `progression_metric_events` are required for contest analytics, they need a non-rewarding telemetry/metric contract rather than invoking the gamification writer for the same activity.

### 2. Game score — intentional progression command

`recordGameScore()` in `services/rewards.js` calls `recordProgressionMetric()` using a generated `game_<gameId>` metric and `sourceType: game`. `GamesPage.jsx` calls `recordGameScore()` only when the user explicitly presses Save score.

No corresponding database trigger on a game-result table was identified in this audit. The current game score path therefore appears to be an intentional direct progression command rather than a duplicate of an automatic domain trigger.

**Classification: PRESERVE / VERIFY PROGRESSION CONTRACT.**

The Architecture runtime should expose this as an explicit progression/reward command, with stable source IDs and server-side validation of the metric configuration.

## Other progression functions

`services/progression.js` exposes `recordProgressionAction` and `recordGamificationActivity`, but repository code search did not expose additional call sites beyond the service definitions. This is a connector/index limitation, not proof of zero runtime callers.

Do not remove either API solely from the search result.

## Important secondary finding

`services/businessLifecycle.js` also exports a `recordProgressionMetric` wrapper around `record_progression_metric_event`, but the current search did not find an import/call site for that business wrapper. Treat it as an exposed capability requiring caller classification, not as an active duplicate until a caller is found.

## Contest service duplication across domains

There are two `submitContestEntry` service implementations:

- consumer `services/contests.js`, which performs the duplicate progression follow-up;
- business `services/businessLifecycle.js`, which calls `submit_contest_entry` behind the `contests` entitlement but does not itself call the progression metric.

This distinction matters: the underlying Supabase command is shared, but the client wrappers currently have different side-effect contracts.

## Architecture decisions

- `record_progression_metric_event` must not be treated as telemetry by default; it is reward-capable.
- A metric whose enabled progression action awards points must not be invoked after a mutation whose trigger already awards the same activity.
- Game scoring is a separate explicit progression use case unless a server-side game-result trigger is later discovered.
- Stable source IDs/idempotency metadata should be supplied by Architecture rather than client-side duplicate suppression.
- Business and consumer wrappers around the same RPC must converge on a single capability contract with explicit caller class and side-effect semantics.

## Wiring gate

**CONTEST: BLOCKED until duplicate reward path is removed or the metric is explicitly made non-rewarding for contest entry.**

**GAMES: eligible for architecture wiring after validating progression action configuration and idempotency.**

No Production mutation was performed.
