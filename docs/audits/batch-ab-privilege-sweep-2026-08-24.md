# Batch AB — Client privilege sweep

Date: 2026-08-24

- Removed direct client mutation privileges from remaining authoritative configuration, entitlement, quest, contest, offline-pack, access-offer, business-membership, family/club, profile, location, report, observation, and session surfaces.
- Removed anonymous mutation access from authenticated user interaction domains.
- Routed favorites, follows, review likes, review amenity feedback, and review photo mutation behind authorized service/RPC paths.
- Retained intentional INSERT-only access for support requests and user feedback.
- Retained normal authenticated interaction writes where no service replacement was established, while removing destructive TRUNCATE capability.

Post-migration privilege audit reduced client mutation-bearing table grants to the small set of explicitly user-submitted or interaction surfaces; authoritative platform/configuration tables no longer expose client mutation privileges.
