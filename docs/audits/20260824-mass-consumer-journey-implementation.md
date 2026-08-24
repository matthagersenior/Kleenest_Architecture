# Mass Consumer Journey Implementation — 2026-08-24

This batch establishes the connected consumer journey model used for the UI rewrite.

## Core journeys

Discovery: Home → Maps → Location
Trust: Location → Check-in → Evidence → Review
Utility: Location → Route → Navigation
Engagement: Trust activity → Quests → Progression → Games
Community: Contributions → Activity → Community → Profile

## Monetization invariant

Free and $5 Premium have identical consumer capabilities. Free displays advertising. Premium removes advertising. Consumer capability checks must never use Premium membership as a prerequisite.

## Implementation standard

Consumer screens must hide technical IDs, raw RPC concepts, database terminology, and operator controls. Every major action should have a human-readable purpose, visible result state, and a clear next step.
