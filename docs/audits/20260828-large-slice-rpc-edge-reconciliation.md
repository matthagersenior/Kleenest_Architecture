# Kleenest — 2026-08-28 Large Slice: RPC / Edge Function / Runtime Reconciliation

## Authority
- Repository: `matthagersenior/Kleenest_Architecture`
- Branch: `main`
- Production Supabase: `ssgesjzdvdsqacdtasje`

## Slice scope
Reconcile production Edge Function families, runtime service boundaries, capability gates, notification delivery, Maps ingestion, Fleet authorization/configuration, and observable API failures before extending product features.

## Findings

### F1 — Account initialization has direct-table contract failures
Production API logs show authenticated requests to `subscriptions` returning 403 and `account_service_entitlements` returning 400 while `get_current_user_product_entitlements` succeeds. `AppContext` still calls billing methods that read those tables directly during boot. This creates a split authority and avoidable initialization failures.

Classification: contract drift / runtime boot dependency.
Action: move subscription/entitlement reads to verified canonical RPC/service contracts; retain direct reads only where production authorization is explicitly verified.
Status: OPEN.

### F2 — Feature telemetry outcome mismatch
`CapabilityGate` and capability coverage can send `outcome: blocked`, but production `record_feature_access` accepts only `allowed`, `locked`, or `denied`. Production logs show HTTP 400 for this RPC. Telemetry errors are swallowed, so the UI can appear healthy while coverage is lost.

Classification: confirmed frontend/backend contract mismatch.
Action: normalize blocked verification failures to the authoritative outcome enum and preserve the verification-error reason in metadata/status.
Status: FIX REQUIRED.

### F3 — Versioned ingestion families remain unresolved
Production has multiple active `public-data-ingest`, `market-bathroom-ingest`, and `ingest-map-candidates` generations. Naming alone is insufficient to retire any version. The inspected `public-data-ingest-v2` contains queue functionality absent from the older base function, while `ingest-map-candidates-v3` is actively returning successful requests.

Classification: version-family interoperability.
Action: matrix callers, auth, inputs, outputs, writes, and scheduling; migrate callers to canonical implementations; retire only proven-unused variants.
Status: MATRIX REQUIRED.

### F4 — `maps-ingest` is repeatedly failing while `ingest-map-candidates-v3` succeeds
Recent production Edge Function logs contain repeated HTTP 500 responses from `maps-ingest` v20. `ingest-map-candidates-v3` v5 is returning HTTP 200. The runtime map discovery path uses the successful v3 function, but scheduled Maps ingestion still targets `maps-ingest`.

Classification: scheduled-ingestion failure / competing ingestion path.
Action: inspect `maps-ingest` v20 body and its scheduled caller contract; reconcile it with the successful canonical ingestion family before changing schedules.
Status: OPEN — high priority.

### F5 — Push delivery is correctly worker-only but incomplete at the product observability layer
`deliver-push-notification` is deliberately deployed with JWT verification disabled and performs its own worker-secret authorization. It records `notification_push_deliveries`. Client registration uses authenticated RPCs. The remaining gap is exposing safe delivery state/history to reporting and owner diagnostics, not exposing the worker endpoint to clients.

Classification: infrastructure/UI parity gap.
Status: NEXT SLICE.

### F6 — Fleet observe/operate/configure separation is resolved
Production now exposes `fleet_observe_access`; `has_fleet_access` is documented as a compatibility read-access alias, while mutations remain manager/controller gated. Architecture Fleet pages distinguish observation from operation. Preserve this boundary.

Classification: RESOLVED; regression watch.

### F7 — Fleet metric configuration exists and is controller-protected
`fleet_metric_definitions`/assignments and controller-protected create/update/assign RPCs exist in the current architecture migrations and Fleet service. Earlier documentation calling this unconfirmed is stale relative to current `main`.

Classification: documentation/capability-state drift.
Action: reconcile the audit registry and verify the controller UI before promoting it to fully GREEN.
Status: OPEN.

## Cross-slice observations

1. The canonical runtime already has a strong service boundary in `AppContext`; strengthen it rather than adding parallel APIs.
2. Production logs reveal concrete breakage that raw function counts do not: telemetry 400s, account boot 400/403s, and repeated Maps 500s.
3. Preserve the rule: actual consumer → actual RPC/Edge Function → actual authorization → actual database effect. Do not perform speculative destructive cleanup.
4. Maps remains canonical on persisted `locations` + `map_network_nearby_v1`; live discovery supplements coverage.
5. Notification push remains worker infrastructure.

## Next large slices

1. Permission/account initialization boundary.
2. Feature telemetry contract repair.
3. Maps ingestion family reconciliation and scheduled failure repair.
4. Edge version-family caller matrix and safe retirement.
5. Push delivery-state convergence into reporting/Owner diagnostics.
6. Fleet metric documentation/UI convergence.

## Acceptance gate

The slice remains open until each confirmed defect is fixed or explicitly matrixed, retested, and verified through the canonical runtime/backend path. No finding is closed because code merely exists or was committed.
