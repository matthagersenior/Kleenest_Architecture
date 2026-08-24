# Continuous workspace hardening — batch 2 — 2026-08-24

Canonical implementation target: `main`.

## Implemented

### Business workspace
Removed dead links from the business operator surface that pointed business users at `/admin/crud`. Those controls are platform-owner-only and are no longer presented as business editing paths. Business users remain inside the business workspace for the operations currently implemented there.

### Enterprise workspace
Removed manual technical identifiers from normal enterprise workflows:

- Network ID is resolved from the selected canonical business context.
- Campaign ID is captured automatically from the campaign returned by the authoritative create operation.
- Partner business context is resolved from the authenticated user's partner memberships.
- Agreement context is resolved from the returned membership data.
- Campaign ROI and outcome recording operate on the selected campaign rather than requiring a user to copy an internal ID.

Internal identifiers remain in application state/service calls where required by the domain contract, but are no longer an operator-facing data-entry requirement.

## Architectural rule reinforced

Workspace users should select domain objects by recognizable business names/context. Internal UUIDs and RPC identifiers are plumbing, not normal workflow inputs.

## Next boundary
Continue the same pass through Fleet, Enterprise lifecycle, Network Intelligence, and authorization edges, then validate the complete action chain from UI control through service/RPC and authoritative refresh.
