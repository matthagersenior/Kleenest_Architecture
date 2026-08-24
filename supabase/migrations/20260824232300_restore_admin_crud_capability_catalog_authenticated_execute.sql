-- Restore the owner/admin catalog RPC's intended authenticated execution boundary.
-- The function itself performs auth.uid() and platform-admin authorization checks.
revoke execute on function public.admin_crud_capability_catalog() from anon;
grant execute on function public.admin_crud_capability_catalog() to authenticated;
