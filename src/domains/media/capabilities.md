# Media Capability Boundary

## Canonical media contexts

- location photos
- review photos
- business media
- featured location photos
- media detail/analytics

## Authority

A media record belongs to a canonical location, review, or business entity. Storage-object state and application media-record state must not become separate authorities.

## Lifecycle

upload/record → ownership authorization → moderation/visibility → featured/reference selection → analytics → deletion/update.

## Dependencies

Identity → entitlement/role → canonical parent entity → storage → media record → location/review/business surfaces.

## Wiring status

Boundary added from Production media/photo capabilities. Storage bucket policies, RPC arguments, and deletion semantics require verification before runtime wiring.
