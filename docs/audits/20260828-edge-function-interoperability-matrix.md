# Edge Function Interoperability Matrix — 2026-08-28

## Authority
Production Supabase: `ssgesjzdvdsqacdtasje`; runtime: `matthagersenior/Kleenest_Architecture:main`.

## Current family matrix

| Family | Active members | Auth | Observed responsibility | Current disposition |
|---|---|---|---|---|
| `ingest-map-candidates` | base, v2, v3 | mixed; base/v3 JWT off, v2 JWT on | live map candidate discovery | `v3` is the current successful runtime discovery path; do not retire others yet |
| `maps-ingest` | v20 | JWT on + admin/service-role handler auth | scheduled market ingestion | failing with repeated 500s; inspect before schedule change |
| `public-data-ingest` | base, v2, v3, v4 | JWT on | public/OSM ingestion and queueing | version overlap; caller matrix required |
| `market-bathroom-ingest` | base, v2, v3, v4, v5 | JWT on | bathroom/source ingestion family | version overlap; caller matrix required |
| `deliver-push-notification` | v1 | JWT off + worker secret | push delivery worker | infrastructure; never browser-facing |
| Stripe | checkout, webhook, portal | checkout/portal JWT on; webhook JWT off | commerce | preserve webhook exception |

## Confirmed caller evidence
- Architecture map discovery calls `ingest-map-candidates-v3`.
- Production logs show successful `ingest-map-candidates-v3` calls.
- Production logs show repeated `maps-ingest` 500s.
- Scheduled Maps jobs previously documented invoke `maps-ingest` for St. Louis and Kansas City.
- Push delivery is trigger/worker infrastructure and is not a normal client RPC.

## Canonicalization rule
A version cannot be removed because its name looks old. Retirement requires evidence for caller absence, equivalent responsibility, equivalent authorization, equivalent writes, and successful replacement verification.

## Immediate corrective path
1. Treat `ingest-map-candidates-v3` as canonical for current runtime live discovery.
2. Treat `maps-ingest` as a separate scheduled ingestion responsibility until its failing v20 contract is repaired or safely migrated.
3. Compare scheduled `maps-ingest` normalization/write behavior against the successful candidate-ingestion pipeline before merging responsibilities.
4. Trace all repository callers and Supabase scheduled invocations for every versioned family.
5. Only then retire proven-unused variants.

## Status
MATRIXED, not closed. No destructive cleanup performed.
