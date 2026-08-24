# Membership preview + Bathroom Trust Game Center — 2026-08-24

## Owner membership virtualization

The prior Owner Tier Preview implementation linked to `/?preview=<tier>` but the canonical runtime did not consistently honor that context. The root cause was a mismatch between the Owner preview route and the membership/workspace authorization logic: Owner status remained the real platform-owner status while the requested presentation tier was not being used to select the rendered workspace, and HashRouter query state was not being preserved across navigation.

### Implemented

- Owner preview now supports Free, Premium, Family, Fleet User, Enterprise User, Business Standard, Business Growth, Business Fleet, and Business Enterprise.
- Preview state is persisted in session storage so the virtualized experience survives navigation.
- HashRouter query parameters are read through React Router rather than `window.location.search`.
- The workspace shell selects the presentation workspace from the preview tier.
- Quick actions preserve preview context.
- Workspace navigation, account, notifications, and brand navigation preserve preview context.
- An explicit `Owner preview · <tier> experience · presentation only` banner and `Exit preview` control are shown while previewing.
- Actual platform-owner authorization remains intact; the preview does not alter the real user's membership or entitlements.

This is presentation virtualization, not identity impersonation. The owner remains the authenticated actor and platform owner.

## Bathroom Trust Game Center

The previous six-game center has been expanded to twelve named games with a common progression contract:

1. Clean Sweep
2. Bathroom Memory
3. Trust or Bust
4. Flush the Facts
5. Restroom Relay
6. Stall Strategy
7. Sink Sprint
8. Route to Relief
9. Review Rater
10. Evidence Detective
11. Amenity Architect
12. Cleanliness Clash

The games intentionally emphasize bathroom trust, review quality, verification, amenities, accessibility, routing, and useful evidence rather than generic arcade behavior.

### Progression integration

Every game uses the existing authoritative `record_game_result` progression RPC. Scores therefore remain part of the existing points/reward/level/badge event chain rather than creating a second gamification authority.

### Multiplayer/follower challenges

Production now includes a protected `game_challenges` contract supporting:

- follower/following eligibility;
- challenge creation;
- pending/accepted/declined/completed/expired states;
- 48-hour challenge expiration;
- one active challenge per game/player pair;
- separate creator and invitee scores;
- winner/tie calculation;
- progression scoring through the existing `record_game_result` authority;
- challenge metadata for trust/review focus;
- authenticated-only security-definer RPCs;
- no direct anonymous/authenticated table access.

The Game Center now exposes:

- opponent selection from followers/following;
- game selection;
- send challenge;
- accept/decline;
- play accepted challenge;
- submit challenge score;
- completed match status and winner/tie result.

## Product principle

The gamification loop is now explicitly:

`learn trust signal → play → score → progression → challenge friend/follower → compete → contribute better evidence → improve restroom intelligence`

The games do not replace real reviews/check-ins/observations. They are an engagement and evidence-literacy layer intended to make those behaviors more understandable and motivating.

## Verification

Production verification confirmed:

- all twelve named games exist in `progression_games` and are enabled;
- multiplayer challenge RPCs are `SECURITY DEFINER`;
- multiplayer challenge RPCs execute for `authenticated` and not `anon`;
- challenge table RLS is enabled and direct table access is revoked;
- challenge scoring invokes the existing authoritative game-result progression path.

## Remaining expansion

The next game batch can add richer real-time multiplayer presence/lobbies, asynchronous tournaments, friend groups/family/team leagues, and location-specific evidence rounds, but those should reuse this challenge contract and the existing progression authority rather than create parallel game/account systems.
