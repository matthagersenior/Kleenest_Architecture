-- Fleet User collaboration boundary
-- Fleet workspace read/observe access is distinct from controller mutation authority.
-- Owners/admins/managers retain mutation authority through the existing controller RPC guards.
create or replace function public.has_fleet_access(p_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public','auth','extensions','pg_temp'
as $$
  select public.is_platform_owner(auth.uid())
    or exists (
      select 1
      from public.business_members bm
      join public.businesses b on b.id = bm.business_id
      where bm.business_id = p_business_id
        and bm.user_id = auth.uid()
        and lower(bm.role::text) in ('owner','admin','manager','member')
        and lower(b.business_tier::text) in ('fleet','enterprise')
    );
$$;

revoke all on function public.has_fleet_access(uuid) from public, anon;
grant execute on function public.has_fleet_access(uuid) to authenticated;

comment on function public.has_fleet_access(uuid) is
'Fleet workspace access for platform owners and business members of Fleet/Enterprise businesses. Member grants workspace/read access; mutation RPCs independently enforce controller authority.';
