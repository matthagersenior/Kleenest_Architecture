# Mass Migration Batch Commit Ledger

Purpose: keep large donor migrations moving without duplicating Architecture authorities.

## Acceptance gate

A donor capability is migrated only when the batch reconciles:

1. donor implementation/history
2. canonical Architecture domain/service
3. Supabase capability/RPC/Edge Function
4. route/workspace entitlement
5. visible UI action/button
6. runtime read/write path
7. deployment/source-of-truth ownership

## Known completed Architecture batches

- Owner platform control center and form-based CRUD
- Account context refresh after business mutations
- Map GPS/cache/discovery orchestration
- Government/public and brand map category coverage
- Fleet metric configuration
- Business/Fleet recommendation derivation
- Offline network cache/event queue
- Workspace/membership/capability reconciliation

## Do-not-duplicate rules

Do not import donor services when Architecture already owns an equivalent canonical service. Extract only missing behavior and wire it through the existing authority.

## Priority continuation order

1. Map discovery Edge Function source ownership + UI action wiring
2. Fleet intelligence/notifications/live-network gaps
3. Enterprise partner/campaign/outcome gaps
4. Business promotions/campaigns/QR/rewards gaps
5. Offline/realtime synchronization gaps
6. Remaining donor UI/runtime wiring
7. Final commit provenance audit and deployment verification

## Commit discipline

Each material batch must produce a real commit on `main`. Multiple independent files/features should be committed in the same batch where safe. Never report a feature as merged without a resulting commit SHA.
