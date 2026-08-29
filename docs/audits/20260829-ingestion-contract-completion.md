# Map Ingestion Contract Completion — 2026-08-29

## Completed contract

The ingestion architecture distinguishes four states:

1. `acquisition_success` — one or more providers successfully returned a bounded response.
2. `acquisition_empty` — providers successfully returned zero usable records.
3. `persistence_succeeded` — all acquired records submitted to canonical persistence completed without persistence errors.
4. `failed` — provider acquisition failure or canonical persistence failure prevented a completed import.

`imported_locations = 0` is not a failure. It is expected on idempotent re-ingestion when external records already map to canonical locations.

## Source strategy

OSM remains the broad free bootstrap source. REFUGE Restrooms is a direct restroom-oriented complementary source. St. Louis municipal data is treated as authoritative provenance for civic/facility context but is not automatically treated as restroom verification because the City describes its datasets as raw extracts and disclaims completeness/accuracy. The City portal currently exposes 72 datasets and 204 distributions across machine-readable formats.

## Evidence rule

External records are evidence attached to canonical locations. A host/facility record does not automatically establish a restroom. Restroom-specific source evidence can establish restroom verification; multiple sources can contribute independent evidence to the same canonical location.

## Idempotency rule

A repeat source run may legitimately produce:

- records_seen > 0
- records_imported = 0
- records_updated/reconciled >= 0
- persistence_status = succeeded
- job_status = completed
- ok = true

This is a successful no-op/reconciliation run, not a failed ingestion.

## Failure rule

No scheduled ingestion may report `ok: true` when canonical persistence fails. Provider failures are retained as structured provider errors. A partial provider failure is distinct from an all-provider empty acquisition.

## Production state at certification

Production contained 10,557 canonical locations, including 8,557 OSM-sourced locations and 0 REFUGE-sourced locations. Six external sources were active in the registry. This confirms that OSM is already materially seeded and that REFUGE remains an independent source available for future reconciliation/backfill.

## Remaining certification boundary

The remaining runtime proof is authenticated browser execution of a deliberately sparse area and a repeated/idempotent run. Database-level certification proves canonical data presence and contract state but does not substitute for the final authenticated UI marker-count test.
