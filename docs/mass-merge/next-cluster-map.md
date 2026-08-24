# Next cluster map

Completed canonical clusters are skipped. Remaining integration work is grouped by dependency, not by file:

1. Access/commerce outcome chain: offer -> purchase -> redemption -> attribution -> reward/outcome telemetry.
2. Progression/trust chain: activity -> quest/challenge -> progression -> reputation -> reward/leaderboard -> notification.
3. Fleet operational chain: route/geofence/event -> performance metric -> prioritized notification -> fleet console -> network telemetry.
4. Enterprise intelligence chain: partner/network event -> segmentation -> campaign/offer/contest -> QR attribution -> outcome/ROI.
5. Offline/realtime convergence: all above events use the canonical queue/sync/realtime paths rather than product-specific caches.

Acceptance: each landed cluster must be reachable from intended product UI and use the existing Supabase authority/RLS contracts; documentation alone never constitutes a capability merge.