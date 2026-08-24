# Batch AF — Platform/service function exposure

Date: 2026-08-24

- Removed authenticated EXECUTE access from platform-owner admin gateways/catalogs and account/business authority setters.
- Removed authenticated EXECUTE access from demo provisioning/identity functions.
- Removed authenticated EXECUTE access from background job processors, notification workers, materializers, leaderboard refreshers, contributor refreshers, and other service-only maintenance functions.
- Removed authenticated EXECUTE access from external metadata synchronization paths that are service-owned.
- Verified the targeted SECURITY DEFINER functions now remain callable by service_role/postgres as appropriate while authenticated access is closed.
- Live privilege verification completed after migration.
