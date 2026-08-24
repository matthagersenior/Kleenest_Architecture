# Trust Quest discovery + consumer UX batch — 2026-08-24

## Finding

The canonical repository already contained a quest engine and QuestSurface, but the consumer-facing surface was effectively an operator/debug form: users had to supply Quest IDs, participation IDs, step IDs and event types. That was incompatible with the product requirement that normal members use features through intuitive UI rather than JSON/technical identifiers.

## Backend implementation

Production now contains six active first-party trust quests:

- First Verified Visit
- Trust Builder
- Accessibility Scout
- Freshness Reporter
- Review Craft
- Bathroom Trust Champion

The quests use the existing authoritative quest engine and progression contracts. Steps are based on verified visits, structured evidence, reviews and trust-game challenges.

A new authenticated-only `quest_list_available(integer)` RPC returns the active quest catalog with human-readable step metadata. Anonymous execute is explicitly revoked; authenticated execute is granted.

## Consumer implementation

QuestSurface was rebuilt around a discovery/catalog experience:

- active quest cards load automatically;
- no Quest ID entry is required;
- users see the mission purpose and reward before starting;
- steps are rendered as human-readable actions;
- `Start quest` invokes the canonical `quest_start` RPC;
- success/error states are visible;
- direct links connect quests to Maps and Play/Progression;
- raw validation/operator fields are removed from the primary consumer surface;
- advanced quest creation remains an operator capability rather than a consumer JSON workflow.

## Product loop

`find restroom → verify visit → contribute evidence → write useful review → earn progression → play trust game → challenge others`

This makes quests an engagement layer around restroom intelligence instead of a disconnected task list.

## Security

The catalog RPC is security-definer and authenticated-only. The initial grant check exposed that `PUBLIC` inheritance still made anonymous execution appear enabled; a follow-up migration explicitly revoked `anon` and retained `authenticated`. Final verification showed authenticated execution available and anonymous execution absent.

## Next batch

The next quest batch should connect actual check-in/review completion events to the current user's active quest automatically, so a user does not need to manually record a quest step. The authoritative `quest_record_step` contract should remain the sole progression authority; the UI should simply react to real contribution events.
