create or replace function public.business_enterprise_action_authorized(p_business_id uuid)
returns boolean language sql stable security invoker set search_path=public,pg_temp as $$
 select public.business_enterprise_authorized(p_business_id);
$$;
grant execute on function public.business_enterprise_action_authorized(uuid) to authenticated;
create or replace function public.business_engagement_action_guard(p_business_id uuid,p_location_id uuid default null)
returns boolean language plpgsql stable security invoker set search_path=public,pg_temp as $$
declare tier text; location_count integer;
begin
 select lower(coalesce(b.service_tier,b.tier,b.plan,'')) into tier from public.businesses b where b.id=p_business_id;
 if tier is null then return false; end if;
 if tier='enterprise' then return true; end if;
 if tier in ('growth','business_growth') then
   select count(*) into location_count from public.business_locations bl where bl.business_id=p_business_id;
   return location_count <= 5;
 end if;
 return false;
end; $$;
grant execute on function public.business_engagement_action_guard(uuid,uuid) to authenticated;
