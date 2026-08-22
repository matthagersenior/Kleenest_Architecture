# Batch G — Enterprise / Partners / Fleet / Offline parity

Production RPC inventory confirms these are first-class backend capabilities.

## Partners

Canonical client boundary covers partner-program discovery, memberships, joining, agreement requests, and agreement acceptance.

## Enterprise

Canonical boundary covers enterprise partner networks, network analytics/benchmarks, campaign/allocation ROI, network creation, campaign creation, partner invitation, and membership status.

## Fleet

Canonical boundary covers fleet access, dashboard summary, maintenance completion, alert resolution, driver/vehicle/route status, and service opportunities.

## Offline

Canonical offline-pack creation uses `create_offline_pack`. Route discovery remains owned by routing; offline storage/download is infrastructure and should not be duplicated inside the routing domain.

## Deliberately excluded

The RPC inventory also contains demo/bootstrap functions, admin gateways, and privileged worker-style operations. Those are not exposed as ordinary application capabilities. Admin authorization remains an explicit security boundary.

## Remaining architecture work

The remaining major capability clusters are Admin/Support, intelligence/data products, live network/realtime, media/storage, and final cross-domain runtime/registry contracts. After those are complete, perform a full architecture audit and only then begin wiring the UI/application shell.
