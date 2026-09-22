# Business RPC Overload Reconciliation v1 — 2026-08-28

## Result
The active Business frontend is already centered on the canonical gateway families `business_manage_location` and `business_manage_qr`; it is not directly dependent on the legacy location/QR overloads.

Evidence from `src/domains/business/management.js`:
- create/update/deactivate location -> `business_manage_location`
- create/update/activate/deactivate QR -> `business_manage_qr`
- create promotion -> `business_create_promotion`

## Production authority
`business_manage_location(uuid,uuid,text,jsonb)` is the active location mutation gateway and performs business-admin authorization plus create/update/deactivate state transitions.

`business_manage_qr(uuid,uuid,uuid,text,jsonb)` is the active QR mutation gateway and performs business-admin authorization, ownership checks, and create/update/deactivate transitions.

`business_create_promotion(uuid,text,text,numeric,uuid,timestamptz,timestamptz)` now delegates to `business_create_promotion_canonical(...)`.

## Legacy overloads not retired
The following remain because the repository index did not establish zero callers for every historical signature:
- `business_create_location` overloads
- `business_set_location_active` overloads
- `business_set_promotion_active` overloads
- `business_update_location` overloads
- `create_business_qr` overloads

They are compatibility/legacy candidates, not current consumer capability gateways.

## Media / verification
The community media service directly calls `submit_location_photo_record` using the 8-parameter compatibility signature. Production preserves the 9-parameter canonical implementation with optional check-in anchoring. The 8-parameter wrapper delegates to the 9-parameter implementation.

`submit_location_verification` similarly has a 4-parameter compatibility wrapper delegating to the 5-parameter implementation with an optional check-in anchor.

## Geofence
The 3-parameter geofence function remains the compact compatibility form; the 6-parameter implementation is the richer canonical form. Do not remove the compact signature until all callers are traced.

## Security
Existing hardening explicitly revokes anonymous execution for sensitive photo and geofence signatures while preserving authenticated application contracts.

## Next safe cleanup
1. Migrate the community media caller to pass the explicit optional check-in parameter, making the canonical 9-argument contract visible in application code.
2. Trace geofence callers and migrate to the 6-argument contract where payload customization is needed.
3. Confirm zero repository/cron/trigger callers for old Business location/QR overloads.
4. Only then revoke/remove legacy overloads.

No destructive overload removal was performed in this slice.
