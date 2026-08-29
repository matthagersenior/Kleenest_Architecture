# Consumer trust → route producer convergence

## Slice

Route-stop arrival is now part of the canonical consumer engagement bridge vocabulary.

## Contract

Domain services remain authoritative. Successful route-stop arrival may publish through `publishConsumerActivity('routeStopArrived', detail)` so the consumer refresh fan-out can update route state, location activity, and progression surfaces without making browser events authoritative.

The existing route producer continues to emit the specialized `kleenest:route-stop-arrived` event for compatibility. This slice adds the canonical bridge vocabulary without removing that specialized signal.

## Downstream path

`route stop -> authoritative arrival -> consumer bridge -> route/location activity/progression refresh`

## Acceptance

- No client-side reward or persistence authority is introduced.
- Existing route-stop arrival persistence remains authoritative in Supabase.
- Existing specialized event remains backward compatible.
- The next producer migration should replace direct equivalent fan-out with `publishConsumerActivity('routeStopArrived', detail)` once the full RouteSurface blob is safely writable against the current branch head.

## Verification

The bridge change is committed independently so CI can validate it against the current `main` head before the next producer migration.
