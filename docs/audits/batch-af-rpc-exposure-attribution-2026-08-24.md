# Batch AF — RPC exposure and attribution hardening

- Removed anonymous EXECUTE from offline-pack and route-discovery mutation RPCs.
- Removed anonymous feedback submission; feedback is authenticated.
- Removed public EXECUTE from the generic updated-at trigger helper.
- Hardened location observation and filter telemetry to authenticated callers with server-side identity and coordinate validation.
- Hardened feature-access telemetry to authenticated callers.
- Verified the resulting EXECUTE privileges after migration.
