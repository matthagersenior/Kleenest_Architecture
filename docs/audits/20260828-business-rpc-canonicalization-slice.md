# Business RPC Canonicalization Slice — 2026-08-28

## Result
The active frontend Business management service does not call the legacy `business_create_location` overloads for location creation; it calls `business_manage_location`. Promotion creation does call `business_create_promotion` with the seven-argument numeric contract.

Production now routes that exact seven-argument numeric `business_create_promotion(uuid,text,text,numeric,uuid,timestamptz,timestamptz)` overload through `business_create_promotion_canonical`.

## Before
`src/domains/business/management.js` invokes:

`business_create_promotion({p_business_id,p_title,p_description,p_discount,p_location_id,p_starts_at,p_ends_at})`

The database contained three promotion-create overloads, including a numeric seven-argument version and a legacy two-argument version.

## After
The seven-argument numeric overload remains as a compatibility contract but its implementation authority is now the canonical function:

`business_create_promotion_canonical(uuid,text,text,numeric,uuid,timestamptz,timestamptz)`

This preserves the active caller contract while unifying authorization, location ownership, entitlement, validation, and write semantics.

## Not retired
The two-argument promotion overload and the UUID-location/text-discount overload remain untouched. They require separate caller/schedule/history evidence before retirement.

Likewise, location overloads remain untouched because the active frontend uses `business_manage_location`; this is evidence against unnecessary migration, not permission to delete legacy signatures.

## Verification
Production function inventory confirms the three promotion overloads still exist after migration. The canonical route is therefore reversible and compatibility-preserving while caller migration continues.

## Next
Trace QR, verification, media, geofence, and remaining Business mutation contracts. Retire an overload only after repository callers, scheduled/trigger callers, grants, and live behavior are proven absent or replaced.
