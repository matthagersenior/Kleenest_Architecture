import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { ingestionError, scheduledResult } from "../_shared/map-ingestion-contract.ts";

Deno.test("scheduled ingestion cannot be ok when persistence fails", () => {
  const result = scheduledResult({ acquisition_status: "success", persistence_status: "failed", job_status: "failed", discovered: 10, imported: 0, updated: 0, observations_upserted: 0, errors: [ingestionError("persistence", "CANONICAL_PERSISTENCE_FAILED", "rpc failed")] });
  assertEquals(result.ok, false);
});

Deno.test("scheduled ingestion succeeds with an explicitly empty acquisition", () => {
  const result = scheduledResult({ acquisition_status: "empty", persistence_status: "succeeded", job_status: "completed", discovered: 0, imported: 0, updated: 0, observations_upserted: 0, errors: [] });
  assertEquals(result.ok, true);
  assertEquals(result.acquisition_status, "empty");
  assertEquals(result.persistence_status, "succeeded");
});

Deno.test("scheduled ingestion fails when upstream acquisition fails", () => {
  const result = scheduledResult({ acquisition_status: "failed", persistence_status: "not_started", job_status: "failed", discovered: 0, imported: 0, updated: 0, observations_upserted: 0, errors: [ingestionError("acquisition", "UPSTREAM_ALL_TILES_FAILED", "all providers failed")] });
  assert(!result.ok);
});
