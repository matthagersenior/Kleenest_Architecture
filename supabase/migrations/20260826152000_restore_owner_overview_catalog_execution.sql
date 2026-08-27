-- Owner Control authenticated entry points. Internal owner authorization remains enforced by each function.
revoke execute on function public.admin_get_overview() from anon;
grant execute on function public.admin_get_overview() to authenticated;
revoke execute on function public.admin_crud_capability_catalog() from anon;
grant execute on function public.admin_crud_capability_catalog() to authenticated;
alter function public.admin_get_overview() set search_path = public, auth, extensions, pg_catalog;
alter function public.admin_crud_capability_catalog() set search_path = public, auth, extensions, pg_catalog;
