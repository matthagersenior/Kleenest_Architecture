# Edge Function Interoperability Matrix — 2026-08-29

## Authority
Production Supabase: `ssgesjzdvdsqacdtasje`; runtime: `matthagersenior/Kleenest_Architecture:main`.

## Live inventory reconciliation

Production currently reports 25 active Edge Functions and 6 pg_cron jobs. The scheduled Maps jobs `kleenest-maps-st-louis` and `kleenest-maps-kansas-city` both call `maps-ingest` and their recent executions are succeeding at the HTTP scheduling layer.

A successful pg_cron `net.http_post` only proves the request was accepted by the HTTP worker; it is not by itself proof that the ingestion payload produced the expected data mutation. Application-level ingestion outcome remains a separate verification target.

## Current family matrix

| Family | Active members | Auth | Observed responsibility | Current disposition |
|---|---|---|---|---|
| `ingest-map-candidates` | base, v2, v3 | mixed; base/v3 JWT off, v2 JWT on | live map candidate discovery | `v3` is current runtime path; v3 implements custom bearer-token authentication before privileged ingestion; do not retire others without caller evidence |
| `maps-ingest` | v23 live | JWT off in production | scheduled market ingestion | separate scheduled responsibility; cron calls confirmed successful at scheduler layer; application-level result still requires verification |
| `public-data-ingest` | base, v2, v3, v4 | JWT on | public/OSM ingestion and queueing | version overlap; caller matrix required |
| `market-bathroom-ingest` | base, v2, v3, v4, v5 | JWT on | bathroom/source ingestion family | version overlap; caller matrix required |
| `deliver-push-notification` | v1 | JWT off + worker secret contract | push delivery worker | infrastructure; never browser-facing |
| Stripe | checkout, webhook, portal | checkout/portal JWT on; webhook JWT off | commerce | preserve webhook exception |

## Confirmed caller evidence

- Repository architecture uses `ingest-map-candidates-v3` for current live discovery.
- Production has `ingest-map-candidates-v3` active at version 5.
- `ingest-map-candidates-v3` performs explicit bearer-token validation itself and only uses the service-role client for ingestion after an authenticated user is resolved.
- `ingest-map-candidates-v2` is separately active and has platform JWT verification enabled, but repository caller evidence for direct runtime use is absent; treat as migration/compatibility candidate, not automatically dead code.
- Production cron jobs explicitly call `maps-ingest` for St. Louis and Kansas City.
- Recent cron executions for both Maps jobs report `succeeded`; this does not certify application-level ingestion output.
- Push delivery remains trigger/worker infrastructure and is not a normal client RPC.

## Security decisions

`verify_jwt=false` is not itself a vulnerability when the function has an intentional custom authentication contract (for example, the v3 candidate function's bearer-token resolution or Stripe's external webhook contract). Conversely, a function with `verify_jwt=true` must still have an authorized application caller; platform JWT validation is authentication, not business authorization.

## Canonicalization rule

A version cannot be removed because its name looks old. Retirement requires evidence for caller absence, equivalent responsibility, equivalent authorization, equivalent writes, and successful replacement verification.

`v3` is the current successful runtime discovery path.

No destructive cleanup performed. Any retirement remains non-destructive until caller, authorization, write-equivalence, and replacement evidence are complete.

## Immediate corrective path

1. Keep `ingest-map-candidates-v3` as the canonical current runtime discovery function.
2. Keep `maps-ingest` separate from live candidate discovery because its scheduled responsibility is distinct.
3. Verify application-level results of scheduled `maps-ingest` executions before modifying schedules.
4. Trace callers and scheduled invocations for every versioned ingestion family.
5. Compare normalization and writes before merging any family members.
6. Only then retire proven-unused variants.

## Status
MATRIXED. Security boundaries reviewed; version-family retirement remains open pending caller/write equivalence evidence.
