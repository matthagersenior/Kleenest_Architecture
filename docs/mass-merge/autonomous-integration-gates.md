# Autonomous mass-merge integration gates

Capabilities already complete in the canonical Architecture runtime are skipped rather than duplicated.

A donor capability may enter `main` only when its behavior is reconciled with the canonical Supabase contract, authorization boundary, service/runtime layer, and reachable UI. Cross-domain event flows must preserve the canonical event, notification, telemetry, offline, and provenance paths.

Batch order is opportunistic: merge compatible clusters together and move immediately to the next incomplete cluster. Stop only for an impassable conflict, failed CI/security gate, or missing authoritative backend contract.

Product boundaries remain explicit: Admin is platform-level; Fleet is an independent operational product; Enterprise is the intelligence/engagement layer; Business Standard receives standard capabilities; Business Growth includes Enterprise capabilities with a five-location cap; the consumer product shares the network without inheriting privileged management surfaces.
