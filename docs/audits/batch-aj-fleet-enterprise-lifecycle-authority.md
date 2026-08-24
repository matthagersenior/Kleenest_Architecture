# Batch AJ — Fleet → Enterprise lifecycle authority

Date: 2026-08-24

## Scope

This batch closes the next Fleet → Enterprise lifecycle boundary and aligns the UI, domain services, Supabase RPCs, authoritative state, refresh behavior, and capability telemetry.

## Implemented

- Added `src/domains/enterprise/lifecycle.js` as the canonical lifecycle service boundary.
- Enterprise campaign creation, activation, pause, campaign outcomes, and network metrics now route through `enterpriseIntelligence`, preserving capability outcome telemetry around mutations.
- Enterprise operations no longer expose campaign, partner-business, agreement, network, or program UUID fields as operator inputs.
- Partner context is resolved from the authenticated user's active memberships and the selected business context.
- Corrected partner-agreement creation to pass the partner-program identifier rather than incorrectly passing the enterprise network identifier.
- Corrected `get_partner_allocation_roi` client parameter mapping from `p_allocation_id` to the authoritative `p_network_id` contract.
- Removed the technical Enterprise lifecycle panel inputs and the platform-owner Fleet enablement action from the operator surface.
- Hardened `get_partner_campaign_roi` and `get_partner_allocation_roi` so only authenticated Fleet/Enterprise owners/admins can execute and receive data for their network.
- Aligned `has_fleet_access` with the product model so authenticated Fleet **and Enterprise** business owners/admins/managers can use the Fleet capability.

## Production verification

The Supabase production migration `harden_partner_roi_authorization_boundaries` was applied successfully. Both ROI RPCs now report `authenticated` execute = true and `anon` execute = false.

The production `has_fleet_access(uuid)` function reports `authenticated` execute = true, `anon` execute = false, and its definition includes both `fleet` and `enterprise` business tiers.

The Supabase security advisor still reports the broad project-wide SECURITY DEFINER lint set. Those are pre-existing/general linter findings; the Enterprise ROI functions are intentionally SECURITY DEFINER with explicit authenticated role/tier/ownership predicates and no anonymous execute privilege.

## End-to-end contract

`UI action → Enterprise lifecycle service → canonical intelligence/partner service → authorized Supabase RPC → authoritative campaign/network state → enterprise-updated refresh → capability outcome telemetry`

Fleet reads now resolve through the same product boundary because `has_fleet_access` recognizes Enterprise business memberships in addition to Fleet memberships.
