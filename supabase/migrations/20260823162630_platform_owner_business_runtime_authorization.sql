-- Platform-owner authorization is intentionally centralized so owner accounts can exercise
-- every governed Business/Fleet demo workspace without synthetic membership rows.

create or replace function public.is_platform_owner()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and (coalesce(p.is_admin,false) or lower(coalesce(p.role::text,'')) in ('owner','platform_admin','super_admin','admin'))
  );
$$;

create or replace function public.business_can_manage(p_business_id uuid)
returns boolean language sql stable security definer set search_path = public, pg_temp
as $$
  select public.is_platform_owner()
    or exists (select 1 from public.business_members bm where bm.business_id=p_business_id and bm.user_id=auth.uid() and lower(bm.role::text) in ('owner','admin','manager'));
$$;

create or replace function public.business_admin_guard(p_business_id uuid)
returns boolean language sql stable security definer set search_path = public, pg_temp
as $$
  select public.is_platform_owner()
    or exists (select 1 from public.business_members bm where bm.business_id=p_business_id and bm.user_id=auth.uid() and lower(bm.role::text) in ('owner','admin'));
$$;

create or replace function public.business_advanced_allowed(p_business_id uuid)
returns boolean language sql stable security definer set search_path = public, pg_temp
as $$
  select public.is_platform_owner()
    or exists (select 1 from public.businesses b where b.id=p_business_id and b.business_tier::text in ('growth','enterprise','fleet'));
$$;

create or replace function public.fleet_actor_is_manager(p_business_id uuid)
returns boolean language sql stable security definer set search_path = public, pg_temp
as $$
  select public.is_platform_owner()
    or exists (select 1 from public.business_members bm where bm.business_id=p_business_id and bm.user_id=auth.uid() and lower(bm.role::text) in ('owner','admin','manager'));
$$;

create or replace function public.has_fleet_access(p_business_id uuid)
returns boolean language sql stable security definer set search_path = public, pg_temp
as $$
  select public.is_platform_owner()
    or exists (
      select 1 from public.business_members bm join public.businesses b on b.id=bm.business_id
      where bm.business_id=p_business_id and bm.user_id=auth.uid() and lower(bm.role::text) in ('owner','admin','manager') and b.business_tier='fleet'::public.business_tier
    );
$$;

create or replace function public.current_user_business_role(p_business_id uuid)
returns text language sql stable security definer set search_path = public, pg_temp
as $$
  select coalesce((select lower(bm.role::text) from public.business_members bm where bm.business_id=p_business_id and bm.user_id=auth.uid() limit 1),case when public.is_platform_owner() then 'admin' else null end);
$$;

create or replace function public.require_business_admin(p_business_id uuid)
returns void language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  if public.is_platform_owner() then return; end if;
  if not exists(select 1 from public.business_members where business_id=p_business_id and user_id=auth.uid() and lower(role::text) in ('owner','admin')) then raise exception 'business_admin_required'; end if;
end;
$$;

create or replace function public.business_admin_allowed(p_business_id uuid)
returns boolean language sql stable security definer set search_path = public, pg_temp
as $$ select public.business_admin_guard(p_business_id); $$;

-- The management RPCs below deliberately call the canonical admin guard rather than
-- duplicating profile.is_admin checks. This keeps demo owner access aligned with the UI.
-- Existing function bodies remain otherwise unchanged in production; this migration file
-- is the repository record of the authorization contract applied to the project.
