# 2026-08-26 UI + Semantic AI Reconciliation Batch

## Scope
Consumer UI journey closure with Semantic AI, while preserving the canonical location/data contract.

## Findings
- The canonical source repository explicitly requires every user-visible action to terminate in a real capability and requires the chain `backend contract → authorization → service → AppContext → route → control → mutation/query → refresh → telemetry` to remain traceable.
- Semantic search is now represented as a consumer route/surface and is wired through `AppContext.services.semanticSearch`.
- Semantic discovery must remain an interpretation layer; canonical location facts, authorization, trust, and ranking remain authoritative.
- Home remains the stable consumer landing surface; semantic search is not allowed to replace the primary Map CTA.

## Implementation status
- Semantic search service: present in `src/domains/intelligence/semantic.js`.
- AppContext service registration: present as `services.semanticSearch`.
- Consumer semantic surface: `src/runtime/SemanticSearchPage.jsx`.
- Semantic route: `/search`.
- AI contract: `docs/architecture/semantic-ai-product-contract.md`.
- Home UI was audited during this batch. An attempted direct Home CTA modification was reverted after source-level validation showed the safest path was to preserve the stable landing surface while keeping semantic search independently reachable. This is intentional: UI changes must not be accepted merely because they compile conceptually; the canonical source must remain stable.

## Next UI closure targets
1. Make Semantic Search reachable from Consumer navigation/search affordances without displacing Map.
2. Close Map → Location → Route → Check-in with authoritative refresh and failure-state preservation.
3. Close QR → Quest → Reward → Notification.
4. Close Family/Premium purchase/access/restore states.
5. Reconcile Business Growth UI against health/action/QR/attribution/ROI services.

## AI rule
AI may interpret natural language, summarize canonical evidence, explain recommendations, and propose next actions. It must not invent location facts, cleanliness, accessibility, occupancy, verification, pricing, promotions, or business claims.
