# Three-Surface Feature Contract

Kleenest is implemented concurrently across three product surfaces:

- Consumer Mobile — the primary native consumer experience.
- Business Mobile — an optional operational companion for businesses; never required for business operation.
- Web — the first-class cross-platform experience for consumers and the primary full-featured Business workspace.

## Single capability, multiple surfaces

A feature is not complete because it exists in Supabase, a domain service, or one application. Each capability is reconciled across the surfaces that need it.

`capability → canonical data/RPC → authorization/entitlement → domain service → state/context → route → visible control → real query/mutation → resulting fact → UI refresh → downstream event/notification/analytics → automated verification`

## Surface policy

### Consumer
Consumers may use the native app or web. Identity, saved state, evidence, check-ins, rewards, quests, notifications, Family, Premium and other shared account state must remain consistent across surfaces.

### Business
Businesses can operate fully from the web without installing an app. Business Mobile is an optional companion for field/on-site workflows. No core Business workflow may depend exclusively on mobile.

### Web
Web is a first-class product surface, not a fallback or admin-only interface. Consumer web and Business web must expose the same canonical capabilities that their respective users are entitled to use, with responsive UX and complete action termination.

## Vertical-slice implementation

Implement capabilities front-to-back across all applicable surfaces in the same batch. Example: QR must cover canonical QR contract, authorization, shared service, Consumer mobile scan/redeem, Business mobile management where useful, Business web management, Consumer web interaction, resulting engagement facts, notifications and analytics.

## Definition of done

A capability remains incomplete if any required surface has only a placeholder, navigation-only control, mock result, client-fabricated fact, dead button, JSON-only operator workflow, missing authorization, or missing resulting-state refresh.

## Store/web parity

Native apps and web may have different presentation and platform-specific interactions, but they must converge on the same canonical contracts and resulting facts. Platform-specific capabilities (camera, push, geolocation, OS navigation) must have a web-safe equivalent or a clearly scoped web limitation.

## Release gate

No Consumer or Business app is considered store-ready while its corresponding required web journey is absent. No Business feature may require a Business Mobile installation unless explicitly classified as an optional field capability.
