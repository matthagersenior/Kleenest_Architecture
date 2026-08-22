# Batch H — Supabase dependency / authority verification

Date: 2026-08-22

## Scope

Verified the Architecture RPC contracts against the live Production Supabase project `ssgesjzdvdsqacdtasje`.

## Results

Every RPC currently represented by the Architecture contracts in this audit exists in the public schema. No missing RPC was found in the checked set.

The checked set includes check-ins, QR, reviews, favorites, follows, events, intelligence notifications, rewards/progression, partner/enterprise, fleet, offline, discovery, reputation, and location verification.

## Security / execution findings

Most user-facing RPCs are executable by `authenticated` and not `anon`, matching their intended role. Several RPCs are SECURITY DEFINER, which reinforces that the client must request an operation rather than reproduce its side effects.

### Immediate security review items

`consume_single_use_qr`, `create_intelligence_notification`, `create_offline_pack`, and `prepare_universal_location_discovery` currently have `anon` execute privilege. Their implementation must be reviewed before treating anonymous access as intentional. Architecture does not assume that existence of an RPC means anonymous callers should be able to invoke it.

## RLS interoperability findings

- `favorites` has authenticated owner-only full CRUD; this aligns with `kleenest_toggle_favorite`.
- `follows` has authenticated self-managed mutation and authenticated read. The live `follow_user(p_user_id)` RPC exists, so an earlier assumption that it was necessarily broken is not established by existence checks alone. Its function body must be inspected before changing the Architecture contract.
- `location_favorites` is a separate authenticated read-only client surface in the checked policies. This confirms the duplicate-store problem remains a real architecture decision: `favorites` and `location_favorites` must not be treated as interchangeable.
- `messages` has participant-scoped select, sender-only insert, and recipient-only update. This is sufficient evidence for a real messaging capability, but send/read/update semantics still need to be represented explicitly in Architecture.
- `live_network_events` permits authenticated inserts when the actor is the caller (or null) and authenticated reads. Its producer contract needs event validation before wiring arbitrary client writes.
- `offline_packs` has owner-scoped full access, and its creation RPC is anonymously executable. Offline-pack creation needs an explicit product/security decision.
- `reviews` has multiple overlapping owner/public policies. Architecture should prefer the RPC for creation but use the public/owner read model deliberately; deletion/update should not be duplicated casually.

## Identity / data-model finding

`create_check_in` takes `p_place_id`, while most newer Architecture capabilities use `p_location_id`. The reference application already contains a place-to-location resolution boundary. This must remain explicit in the final runtime adapter so that a Place ID is never silently treated as a Location ID.

## Gate status

**NOT READY TO WIRE.**

Before wiring:

1. inspect function definitions for all Architecture RPCs;
2. resolve `favorites` vs `location_favorites`;
3. inspect `follow_user` body and its actual target tables;
4. review anonymous EXECUTE on the four listed RPCs;
5. map message lifecycle into Architecture;
6. validate live-network event producers;
7. verify every RPC's referenced tables/functions exist and are compatible;
8. perform the final GitHub-to-Supabase capability matrix.
